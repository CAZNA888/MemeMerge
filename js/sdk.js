(function () {
    "use strict";

    const PLACEMENT_INTERSTITIAL = "default";
    const PLACEMENT_REWARDED = "default";
    const PLACEMENT_BANNER = "default";

    const IAP_KNOWN_IDS = ["coins_10000", "coins_100000", "coins_1000000", "vip_forever"];

    const sdkState = {
        bridge: null,
        platformLanguage: "",
        isLocalMode: true,
        isReady: false,
        isGameplayActive: false,
        remoteFlags: {},
        lifecycleBound: false,
        platformEventsBound: false,
        audioEventBound: false,
        lastInterstitialAt: 0,
        bannerTimerId: 0,
        iapCatalogById: Object.create(null),
        portalCurrencyImage: null,
        portalCurrencyImageUrl: ""
    };

    function getBridge() {
        return window.bridge || window.playgamaBridge || null;
    }

    function isOnlineMode() {
        return !sdkState.isLocalMode && Boolean(getBridge());
    }

    function isLocalMode() {
        return !isOnlineMode();
    }

    function isAdsSupported() {
        const bridge = getBridge();
        return Boolean(isOnlineMode() && bridge?.advertisement);
    }

    function isPaymentsSupported() {
        const bridge = getBridge();
        return Boolean(isOnlineMode() && bridge?.payments?.isSupported);
    }

    function isLeaderboardsSupported() {
        const bridge = getBridge();
        return Boolean(isOnlineMode() && bridge?.leaderboards && bridge.leaderboards.type !== "not_available");
    }

    function waitForBridge(timeoutMs) {
        const waitForGlobalBridge = () => new Promise((resolve) => {
            const start = Date.now();

            function tick() {
                if (getBridge() || Date.now() - start >= timeoutMs) {
                    resolve();
                    return;
                }

                window.setTimeout(tick, 50);
            }

            tick();
        });

        if (getBridge()) {
            return Promise.resolve();
        }

        const loaderReady = window.PlaygamaBridgeLoader?.ready;
        if (!loaderReady) {
            return waitForGlobalBridge();
        }

        return loaderReady
            .catch((error) => {
                console.warn("Playgama Bridge loader failed.", error);
            })
            .then(() => {
                if (getBridge()) {
                    return;
                }

                return waitForGlobalBridge();
            });
    }

    function init() {
        return waitForBridge(5000).then(() => {
            const bridge = getBridge();
            sdkState.bridge = bridge;

            if (!bridge || typeof bridge.initialize !== "function") {
                console.warn("Playgama Bridge not found, local mode enabled.");
                sdkState.isLocalMode = true;
                bindLifecycleEvents();
                sdkState.isReady = true;
                return sdkState;
            }

            return bridge.initialize()
                .then(() => {
                    sdkState.isLocalMode = false;
                    sdkState.platformLanguage = String(bridge.platform?.language || "").toLowerCase();

                    const minSec = Math.max(0, Math.floor(Number(window.AdConfig?.interstitialMinIntervalMs) / 1000));
                    if (minSec > 0 && typeof bridge.advertisement?.setMinimumDelayBetweenInterstitial === "function") {
                        bridge.advertisement.setMinimumDelayBetweenInterstitial(minSec);
                    }

                    return fetchRemoteFlags()
                        .then(() => refreshIapCatalog().catch(() => {}))
                        .then(() => {
                            bindBridgePlatformEvents();
                        });
                })
                .catch((error) => {
                    console.warn("Playgama Bridge init failed, local mode enabled.", error);
                    sdkState.isLocalMode = true;
                    sdkState.bridge = null;
                    return refreshIapCatalog().catch(() => {});
                })
                .then(() => {
                    bindLifecycleEvents();
                    startStickyBannerLoop();
                    sdkState.isReady = true;
                    return sdkState;
                });
        });
    }

    function getPreferredLanguage() {
        return String(sdkState.platformLanguage || "");
    }

    function localStorageFallback() {
        return window.localStorage;
    }

    function loadSave() {
        const key = window.Base.saveKey;

        if (sdkState.isLocalMode || !getBridge()?.storage?.get) {
            return Promise.resolve().then(() => {
                const raw = localStorageFallback().getItem(key);
                return raw ? JSON.parse(raw) : null;
            }).catch((error) => {
                console.warn("Local save get failed.", error);
                return null;
            });
        }

        return getBridge().storage.get(key).then((data) => {
            if (data == null) {
                return null;
            }

            if (typeof data === "string") {
                return JSON.parse(data);
            }

            return data;
        }).catch((error) => {
            console.warn("Bridge storage get failed, fallback to localStorage.", error);
            const raw = localStorageFallback().getItem(key);
            return raw ? JSON.parse(raw) : null;
        });
    }

    function saveData(data, flush) {
        void flush;
        const key = window.Base.saveKey;
        const json = JSON.stringify(data);

        if (sdkState.isLocalMode || !getBridge()?.storage?.set) {
            return Promise.resolve().then(() => {
                localStorageFallback().setItem(key, json);
            }).catch((error) => {
                console.warn("Local save set failed.", error);
            });
        }

        return getBridge().storage.set(key, json)
            .catch((error) => {
                console.warn("Bridge storage set failed, fallback to localStorage.", error);
                localStorageFallback().setItem(key, json);
            })
            .then(() => undefined);
    }

    function ready() {
        const bridge = getBridge();
        if (bridge?.platform?.sendMessage) {
            return bridge.platform.sendMessage("game_ready").then(() => true).catch(() => false);
        }

        return Promise.resolve(false);
    }

    function gameplayStart() {
        sdkState.isGameplayActive = true;
        window.GameAssets?.setAppSuspended?.(document.visibilityState === "hidden");
    }

    function gameplayStop() {
        sdkState.isGameplayActive = false;
        window.GameAssets?.setAppSuspended?.(true);
    }

    function isAvailableMethod(name) {
        const bridge = getBridge();
        if (!bridge || sdkState.isLocalMode) {
            return Promise.resolve(false);
        }

        if (name === "leaderboards.setScore") {
            return Promise.resolve(Boolean(bridge.leaderboards?.setScore) && bridge.leaderboards.type !== "not_available");
        }

        if (name === "leaderboards.getEntries") {
            return Promise.resolve(Boolean(bridge.leaderboards?.getEntries) && bridge.leaderboards.type === "in_game");
        }

        return Promise.resolve(false);
    }

    function showFullscreenAdv() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.showInterstitial) {
            return Promise.resolve({ shown: false, local: true });
        }

        if (!bridge.advertisement.isInterstitialSupported) {
            return Promise.resolve({ shown: false, local: false });
        }

        const minInterval = Math.max(0, Number(window.AdConfig?.interstitialMinIntervalMs) || 0);
        const now = Date.now();
        if (minInterval > 0 && now - sdkState.lastInterstitialAt < minInterval) {
            return Promise.resolve({ shown: false, reason: "cooldown" });
        }

        const eventName = bridge.EVENT_NAME?.INTERSTITIAL_STATE_CHANGED || "interstitial_state_changed";

        return new Promise((resolve) => {
            let sawOpened = false;
            let finished = false;
            const timeoutMs = 90000;
            const timeoutId = window.setTimeout(() => {
                done({ shown: false, error: new Error("interstitial_timeout") });
            }, timeoutMs);

            function done(result) {
                if (finished) {
                    return;
                }

                finished = true;
                window.clearTimeout(timeoutId);
                bridge.advertisement.off(eventName, onState);
                gameplayStart();
                resolve(result);
            }

            function onState(state) {
                if (state === "opened") {
                    sawOpened = true;
                    gameplayStop();
                }

                if (state === "closed") {
                    if (sawOpened) {
                        sdkState.lastInterstitialAt = Date.now();
                        window.GameAnalytics?.reportAdImpression?.("interstitial", {
                            placement: PLACEMENT_INTERSTITIAL
                        });
                    }

                    done({ shown: sawOpened, error: undefined });
                } else if (state === "failed") {
                    done({ shown: false, error: new Error("interstitial_failed") });
                }
            }

            gameplayStop();
            bridge.advertisement.on(eventName, onState);

            try {
                bridge.advertisement.showInterstitial(PLACEMENT_INTERSTITIAL);
            } catch (error) {
                window.clearTimeout(timeoutId);
                bridge.advertisement.off(eventName, onState);
                gameplayStart();
                resolve({ shown: false, error });
            }
        });
    }

    function showBannerAdv() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.showBanner) {
            return Promise.resolve({ stickyAdvIsShowing: false, local: true });
        }

        if (!bridge.advertisement.isBannerSupported) {
            return Promise.resolve({ stickyAdvIsShowing: false, local: false });
        }

        return bridge.advertisement.showBanner("bottom", PLACEMENT_BANNER)
            .then(() => {
                const showing = bridge.advertisement.bannerState === "shown";
                if (showing) {
                    window.GameAnalytics?.reportAdImpression?.("banner", {
                        placement: PLACEMENT_BANNER
                    });
                }
                return { stickyAdvIsShowing: showing };
            })
            .catch((error) => ({ stickyAdvIsShowing: false, error }));
    }

    function hideBannerAdv() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.hideBanner) {
            return Promise.resolve({ stickyAdvIsShowing: false, local: true });
        }

        return bridge.advertisement.hideBanner()
            .then(() => ({ stickyAdvIsShowing: false }))
            .catch((error) => ({ stickyAdvIsShowing: false, error }));
    }

    function ensureStickyBannerVisible() {
        if (!window.AdConfig?.stickyBannerEnabled) {
            return Promise.resolve();
        }

        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement) {
            return Promise.resolve();
        }

        return Promise.resolve().then(() => {
            if (bridge.advertisement.bannerState === "shown") {
                return;
            }

            return showBannerAdv();
        }).catch((error) => {
            void error;
        });
    }

    function startStickyBannerLoop() {
        window.clearInterval(sdkState.bannerTimerId);

        if (!window.AdConfig?.stickyBannerEnabled || !isAdsSupported()) {
            return;
        }

        ensureStickyBannerVisible();
        const recheckMs = Math.max(10000, Number(window.AdConfig?.stickyBannerRecheckMs) || 60000);
        sdkState.bannerTimerId = window.setInterval(() => {
            ensureStickyBannerVisible();
        }, recheckMs);
    }

    function showRewardedVideo() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.showRewarded) {
            return Promise.resolve({ shown: false, rewarded: false, local: true });
        }

        if (!bridge.advertisement.isRewardedSupported) {
            return Promise.resolve({ shown: false, rewarded: false, local: false });
        }

        let rewarded = false;
        let sawOpened = false;
        const eventName = bridge.EVENT_NAME?.REWARDED_STATE_CHANGED || "rewarded_state_changed";

        return new Promise((resolve) => {
            let finished = false;
            const timeoutMs = 90000;
            const timeoutId = window.setTimeout(() => {
                done({
                    shown: false,
                    rewarded: false,
                    error: new Error("rewarded_timeout")
                });
            }, timeoutMs);

            function done(payload) {
                if (finished) {
                    return;
                }

                finished = true;
                window.clearTimeout(timeoutId);
                bridge.advertisement.off(eventName, onState);
                gameplayStart();
                resolve(payload);
            }

            function onState(state) {
                if (state === "opened") {
                    sawOpened = true;
                    gameplayStop();
                }

                if (state === "rewarded") {
                    rewarded = true;
                    window.GameAnalytics?.reportRewardGranted?.({
                        ad_type: "rewarded",
                        placement: PLACEMENT_REWARDED
                    });
                }

                if (state === "closed" || state === "failed") {
                    if (sawOpened || rewarded) {
                        window.GameAnalytics?.reportAdImpression?.("rewarded", {
                            placement: PLACEMENT_REWARDED,
                            rewarded
                        });
                    }
                    done({
                        shown: sawOpened || rewarded,
                        rewarded,
                        error: state === "failed" ? new Error("rewarded_failed") : undefined
                    });
                }
            }

            gameplayStop();
            bridge.advertisement.on(eventName, onState);

            try {
                bridge.advertisement.showRewarded(PLACEMENT_REWARDED);
            } catch (error) {
                window.clearTimeout(timeoutId);
                bridge.advertisement.off(eventName, onState);
                gameplayStart();
                resolve({ shown: false, rewarded: false, error });
            }
        });
    }

    function submitLeaderboardScore(score, extraData) {
        void extraData;
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.leaderboards?.setScore) {
            return Promise.resolve(false);
        }

        return isAvailableMethod("leaderboards.setScore").then((allowed) => {
            if (!allowed) {
                return false;
            }

            return bridge.leaderboards.setScore(
                window.Base.leaderboardName,
                Math.max(0, Math.floor(Number(score) || 0))
            ).then(() => true).catch((error) => {
                console.warn("Leaderboard setScore failed.", error);
                return false;
            });
        });
    }

    function getLeaderboardEntries(options) {
        void options;
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.leaderboards?.getEntries) {
            return Promise.resolve(null);
        }

        if (bridge.leaderboards.type !== "in_game") {
            return Promise.resolve(null);
        }

        return bridge.leaderboards.getEntries(window.Base.leaderboardName).then((list) => {
            const entries = Array.isArray(list) ? list : [];

            return {
                entries: entries.map((entry, index) => ({
                    rank: Number(entry?.rank) || index + 1,
                    score: Number(entry?.score) || 0,
                    player: {
                        publicName: entry?.name || ""
                    }
                }))
            };
        }).catch((error) => {
            console.warn("Leaderboard getEntries failed.", error);
            return null;
        });
    }

    function getIapDefinitions() {
        return (window.IapCatalogDefinitions && typeof window.IapCatalogDefinitions === "object")
            ? window.IapCatalogDefinitions
            : {};
    }

    function buildFallbackCatalogRows() {
        const defs = getIapDefinitions();
        const label = String(window.InAppPurchaseConfig?.defaultCurrencyLabel || "G").trim() || "G";

        return IAP_KNOWN_IDS.map((id) => {
            const row = defs[id];
            const cost = Math.max(0, Math.floor(Number(row?.cost) || 0));

            return {
                id,
                price: cost > 0 ? `${cost} ${label}` : "",
                priceCurrencyCode: label,
                priceValue: String(cost),
                description: row?.descriptionEn || ""
            };
        }).filter((row) => row.id);
    }

    function normalizeCatalogItem(raw) {
        const id = String(raw?.id || raw?.productId || "").trim();
        if (!id) {
            return null;
        }

        const defs = getIapDefinitions();
        const def = defs[id] || {};
        const bridgePrice = raw?.price != null ? String(raw.price).trim() : "";
        const bridgeCode = String(raw?.priceCurrencyCode || "").trim();
        const rawVal = raw?.priceValue;
        const bridgeValue = rawVal != null && String(rawVal).trim() !== ""
            ? Math.floor(Number(rawVal))
            : NaN;
        const fallbackCost = Math.max(0, Math.floor(Number(def.cost) || 0));
        const label = bridgeCode || String(window.InAppPurchaseConfig?.defaultCurrencyLabel || "G").trim() || "G";
        const numeric = Number.isFinite(bridgeValue) && bridgeValue > 0 ? bridgeValue : fallbackCost;
        const price = bridgePrice || (numeric > 0 ? `${numeric} ${label}` : "");

        return {
            id,
            price,
            priceCurrencyCode: bridgeCode || label,
            priceValue: String(numeric),
            description: String(raw?.description || raw?.descriptionEn || def.descriptionEn || "").trim()
        };
    }

    function mergeCatalogRows(bridgeList) {
        const byId = Object.create(null);

        (Array.isArray(bridgeList) ? bridgeList : []).forEach((item) => {
            const normalized = normalizeCatalogItem(item);
            if (normalized) {
                byId[normalized.id] = normalized;
            }
        });

        buildFallbackCatalogRows().forEach((fallback) => {
            if (!byId[fallback.id]) {
                byId[fallback.id] = fallback;
            } else {
                const cur = byId[fallback.id];
                if (!cur.price) {
                    cur.price = fallback.price;
                }

                if (!cur.priceCurrencyCode) {
                    cur.priceCurrencyCode = fallback.priceCurrencyCode;
                }

                if (!Number.isFinite(Number(cur.priceValue)) || Number(cur.priceValue) <= 0) {
                    cur.priceValue = fallback.priceValue;
                }

                if (!cur.description) {
                    cur.description = fallback.description;
                }
            }
        });

        return IAP_KNOWN_IDS.map((id) => byId[id]).filter(Boolean);
    }

    function refreshIapCatalog() {
        sdkState.iapCatalogById = Object.create(null);
        sdkState.portalCurrencyImage = null;
        sdkState.portalCurrencyImageUrl = "";

        let bridgeList = [];

        const bridge = getBridge();
        if (bridge?.payments?.getCatalog && bridge.payments.isSupported && !sdkState.isLocalMode) {
            return bridge.payments.getCatalog().then((list) => {
                bridgeList = list;
            }).catch((error) => {
                console.warn("getCatalog failed, using static prices.", error);
            }).then(() => {
                const merged = mergeCatalogRows(bridgeList);

                merged.forEach((product) => {
                    if (product?.id) {
                        sdkState.iapCatalogById[product.id] = product;
                    }
                });
            });
        }

        const merged = mergeCatalogRows(bridgeList);

        merged.forEach((product) => {
            if (product?.id) {
                sdkState.iapCatalogById[product.id] = product;
            }
        });
        return Promise.resolve();
    }

    function loadIapCatalogUiMedia() {
        return refreshIapCatalog();
    }

    function getIapCatalogProduct(productId) {
        const id = String(productId || "").trim();

        if (!id) {
            return null;
        }

        return sdkState.iapCatalogById[id] || null;
    }

    function getPortalCurrencyImage() {
        return sdkState.portalCurrencyImage;
    }

    function getPurchasesCatalog() {
        if (IAP_KNOWN_IDS.every((id) => !sdkState.iapCatalogById[id])) {
            return refreshIapCatalog().then(() => IAP_KNOWN_IDS.map((id) => sdkState.iapCatalogById[id]).filter(Boolean));
        }

        return Promise.resolve(IAP_KNOWN_IDS.map((id) => sdkState.iapCatalogById[id]).filter(Boolean));
    }

    function purchaseProduct(productId, developerPayload) {
        const bridge = getBridge();
        const product = getIapCatalogProduct(productId);
        const amount = Number(product?.priceValue);
        const currencyCode = String(product?.priceCurrencyCode || "");

        window.GameAnalytics?.reportPurchaseAttempt?.(productId, {
            developer_payload: String(developerPayload || "")
        });

        if (sdkState.isLocalMode || !bridge?.payments?.purchase || !productId) {
            return Promise.resolve({ success: false, local: sdkState.isLocalMode });
        }

        if (!bridge.payments.isSupported) {
            return Promise.resolve({ success: false, local: false });
        }

        gameplayStop();
        const pid = String(productId);
        const purchasePromise = developerPayload
            ? bridge.payments.purchase(pid, { developerPayload: String(developerPayload) })
            : bridge.payments.purchase(pid);

        return purchasePromise.then((purchase) => {
            gameplayStart();
            const id = purchase?.id || productId;
            window.GameAnalytics?.reportPurchaseSuccess?.(id, amount, currencyCode, {
                developer_payload: String(developerPayload || "")
            });
            return {
                success: true,
                purchase: Object.assign({}, purchase, {
                    purchaseToken: id,
                    token: id,
                    productID: id,
                    productId: id
                })
            };
        }).catch((error) => {
            gameplayStart();
            console.warn("Purchase failed.", error);
            return { success: false, error };
        });
    }

    function consumePurchase(productId) {
        if (sdkState.isLocalMode) {
            return Promise.resolve(false);
        }

        const bridge = getBridge();
        const id = String(productId || "").trim();

        if (!bridge?.payments?.consumePurchase || !id) {
            return Promise.resolve(false);
        }

        return bridge.payments.consumePurchase(id)
            .then(() => true)
            .catch((error) => {
                console.warn("consumePurchase failed.", error);
                return false;
            });
    }

    function claimPendingPurchases(grantCallback) {
        if (sdkState.isLocalMode) {
            return Promise.resolve(0);
        }

        const bridge = getBridge();

        if (!bridge?.payments?.getPurchases) {
            return Promise.resolve(0);
        }

        let claimed = 0;
        return bridge.payments.getPurchases().then((purchases) => {
            const list = Array.isArray(purchases) ? purchases : [];
            let chain = Promise.resolve();

            for (let index = 0; index < list.length; index += 1) {
                const item = list[index];
                const productId = item?.id || item?.productID || item?.productId;

                if (!productId || typeof grantCallback !== "function") {
                    continue;
                }

                const granted = Boolean(grantCallback(productId, item));
                if (granted) {
                    claimed += 1;
                    chain = chain.then(() => consumePurchase(productId));
                }
            }
            return chain.then(() => claimed);
        }).catch((error) => {
            console.warn("getPurchases failed.", error);
            return claimed;
        });
    }

    function fetchRemoteFlags() {
        const bridge = getBridge();
        const defaults = (window.RemoteFlagsDefaultConfig && typeof window.RemoteFlagsDefaultConfig === "object")
            ? window.RemoteFlagsDefaultConfig
            : {};

        if (sdkState.isLocalMode || !bridge?.remoteConfig?.get || !bridge.remoteConfig.isSupported) {
            sdkState.remoteFlags = {};
            return Promise.resolve(sdkState.remoteFlags);
        }

        let options = {};
        if (bridge.platform?.id === "yandex") {
            options = {
                clientFeatures: Object.keys(defaults).map((name) => ({
                    name,
                    value: String(defaults[name] != null ? defaults[name] : "")
                }))
            };
        }

        return bridge.remoteConfig.get(options).then((flags) => {
            const remote = flags && typeof flags === "object" ? flags : {};
            sdkState.remoteFlags = Object.assign({}, defaults, remote);
            applyRemoteFlags(sdkState.remoteFlags);
            return sdkState.remoteFlags;
        }).catch((error) => {
            sdkState.remoteFlags = Object.assign({}, defaults);
            console.warn("Remote flags unavailable.", error);
            return sdkState.remoteFlags;
        });
    }

    function applyRemoteFlags(flags) {
        if (!flags || typeof flags !== "object") {
            return;
        }

        const numberMap = [
            ["characterOfferPrice", "characterOfferPrice"],
            ["battleWinCoins", "battleWinCoins"],
            ["battleLoseCoins", "battleLoseCoins"],
            ["battleWinCups", "battleWinCups"],
            ["battleLoseCups", "battleLoseCups"],
            ["battleCooldownSeconds", "battleCooldownSeconds"]
        ];

        numberMap.forEach(([flagKey, configKey]) => {
            if (!(flagKey in flags)) {
                return;
            }

            const numericValue = Number(flags[flagKey]);
            if (!Number.isFinite(numericValue)) {
                return;
            }

            if (window.EconomyConfig && configKey in window.EconomyConfig) {
                window.EconomyConfig[configKey] = numericValue;
            }
        });
    }

    function bindLifecycleEvents() {
        if (sdkState.lifecycleBound) {
            return;
        }

        sdkState.lifecycleBound = true;

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                gameplayStop();
                window.Game?.saveNow?.();
            } else {
                gameplayStart();
            }
        });

        window.addEventListener("blur", () => {
            gameplayStop();
            window.Game?.saveNow?.();
        });

        window.addEventListener("focus", () => {
            if (document.visibilityState !== "hidden") {
                gameplayStart();
            }
        });

        window.addEventListener("pagehide", () => {
            gameplayStop();
            window.Game?.saveNow?.();
        });

        window.addEventListener("beforeunload", () => {
            gameplayStop();
            window.Game?.saveNow?.();
        });
    }

    function bindBridgePlatformEvents() {
        const bridge = getBridge();

        if (sdkState.platformEventsBound || !bridge?.platform?.on) {
            return;
        }

        sdkState.platformEventsBound = true;

        const pauseEvent = bridge.EVENT_NAME?.PAUSE_STATE_CHANGED || "pause_state_changed";
        bridge.platform.on(pauseEvent, (isPaused) => {
            if (isPaused) {
                gameplayStop();
                window.Game?.saveNow?.();
            } else if (document.visibilityState !== "hidden") {
                gameplayStart();
            }
        });
    }

    function bindBridgeAudioEvents() {
        const bridge = getBridge();

        if (sdkState.audioEventBound || !bridge?.platform?.on) {
            return;
        }

        sdkState.audioEventBound = true;

        if (bridge.platform.isAudioEnabled === false) {
            window.GameAssets?.setAppSuspended?.(true);
        }

        const audioEvent = bridge.EVENT_NAME?.AUDIO_STATE_CHANGED || "audio_state_changed";
        bridge.platform.on(audioEvent, (isEnabled) => {
            if (!isEnabled) {
                window.GameAssets?.setAppSuspended?.(true);
            } else {
                window.GameAssets?.setAppSuspended?.(document.visibilityState === "hidden");
            }
        });
    }

    function attachDeferredBridgeListeners() {
        if (!sdkState.isLocalMode) {
            bindBridgeAudioEvents();
        }
    }

    window.GameSDK = {
        state: sdkState,
        init,
        isOnlineMode,
        isLocalMode,
        isAdsSupported,
        isPaymentsSupported,
        isLeaderboardsSupported,
        getPreferredLanguage,
        waitForBridge,
        waitForYandexSdk: waitForBridge,
        loadSave,
        saveData,
        ready,
        gameplayStart,
        gameplayStop,
        showFullscreenAdv,
        showRewardedVideo,
        showBannerAdv,
        hideBannerAdv,
        ensureStickyBannerVisible,
        submitLeaderboardScore,
        getLeaderboardEntries,
        getPurchasesCatalog,
        getIapCatalogProduct,
        getPortalCurrencyImage,
        purchaseProduct,
        consumePurchase,
        claimPendingPurchases,
        fetchRemoteFlags,
        isAvailableMethod,
        refreshIapCatalog,
        attachDeferredBridgeListeners
    };
}());
