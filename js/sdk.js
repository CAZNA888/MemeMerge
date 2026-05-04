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

    function waitForBridge(timeoutMs) {
        if (getBridge()) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
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
    }

    async function init() {
        await waitForBridge(5000);

        const bridge = getBridge();
        sdkState.bridge = bridge;

        if (!bridge || typeof bridge.initialize !== "function") {
            console.warn("Playgama Bridge not found, local mode enabled.");
            sdkState.isLocalMode = true;
            bindLifecycleEvents();
            sdkState.isReady = true;
            return sdkState;
        }

        try {
            await bridge.initialize();
            sdkState.isLocalMode = false;
            sdkState.platformLanguage = String(bridge.platform?.language || "").toLowerCase();

            const minSec = Math.max(0, Math.floor(Number(window.AdConfig?.interstitialMinIntervalMs) / 1000));
            if (minSec > 0 && typeof bridge.advertisement?.setMinimumDelayBetweenInterstitial === "function") {
                bridge.advertisement.setMinimumDelayBetweenInterstitial(minSec);
            }

            await fetchRemoteFlags();
            await refreshIapCatalog().catch(() => {});
            bindBridgePlatformEvents();
        } catch (error) {
            console.warn("Playgama Bridge init failed, local mode enabled.", error);
            sdkState.isLocalMode = true;
            await refreshIapCatalog().catch(() => {});
        }

        bindLifecycleEvents();
        startStickyBannerLoop();
        sdkState.isReady = true;
        return sdkState;
    }

    function getPreferredLanguage() {
        return String(sdkState.platformLanguage || "");
    }

    function localStorageFallback() {
        return window.localStorage;
    }

    async function loadSave() {
        const key = window.Base.saveKey;

        if (sdkState.isLocalMode || !getBridge()?.storage?.get) {
            const raw = localStorageFallback().getItem(key);
            return raw ? JSON.parse(raw) : null;
        }

        try {
            const data = await getBridge().storage.get(key);
            if (data == null) {
                return null;
            }

            if (typeof data === "string") {
                return JSON.parse(data);
            }

            return data;
        } catch (error) {
            console.warn("Bridge storage get failed, fallback to localStorage.", error);
        }

        const raw = localStorageFallback().getItem(key);
        return raw ? JSON.parse(raw) : null;
    }

    async function saveData(data, flush) {
        void flush;
        const key = window.Base.saveKey;
        const json = JSON.stringify(data);

        if (sdkState.isLocalMode || !getBridge()?.storage?.set) {
            localStorageFallback().setItem(key, json);
            return undefined;
        }

        try {
            await getBridge().storage.set(key, json);
        } catch (error) {
            console.warn("Bridge storage set failed, fallback to localStorage.", error);
            localStorageFallback().setItem(key, json);
        }

        return undefined;
    }

    function ready() {
        const bridge = getBridge();
        if (bridge?.platform?.sendMessage) {
            bridge.platform.sendMessage("game_ready").catch(() => {});
        }
    }

    function gameplayStart() {
        sdkState.isGameplayActive = true;
        window.GameAssets?.setAppSuspended?.(document.visibilityState === "hidden");
    }

    function gameplayStop() {
        sdkState.isGameplayActive = false;
        window.GameAssets?.setAppSuspended?.(true);
    }

    async function isAvailableMethod(name) {
        const bridge = getBridge();
        if (!bridge || sdkState.isLocalMode) {
            return false;
        }

        if (name === "leaderboards.setScore") {
            return Boolean(bridge.leaderboards?.setScore) && bridge.leaderboards.type !== "not_available";
        }

        if (name === "leaderboards.getEntries") {
            return Boolean(bridge.leaderboards?.getEntries) && bridge.leaderboards.type === "in_game";
        }

        return false;
    }

    async function showFullscreenAdv() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.showInterstitial) {
            return { shown: false, local: true };
        }

        if (!bridge.advertisement.isInterstitialSupported) {
            return { shown: false, local: false };
        }

        const minInterval = Math.max(0, Number(window.AdConfig?.interstitialMinIntervalMs) || 0);
        const now = Date.now();
        if (minInterval > 0 && now - sdkState.lastInterstitialAt < minInterval) {
            return { shown: false, reason: "cooldown" };
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

    async function showBannerAdv() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.showBanner) {
            return { stickyAdvIsShowing: false, local: true };
        }

        if (!bridge.advertisement.isBannerSupported) {
            return { stickyAdvIsShowing: false, local: false };
        }

        try {
            await bridge.advertisement.showBanner("bottom", PLACEMENT_BANNER);
            const showing = bridge.advertisement.bannerState === "shown";
            return { stickyAdvIsShowing: showing };
        } catch (error) {
            return { stickyAdvIsShowing: false, error };
        }
    }

    async function hideBannerAdv() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.hideBanner) {
            return { stickyAdvIsShowing: false, local: true };
        }

        try {
            await bridge.advertisement.hideBanner();
            return { stickyAdvIsShowing: false };
        } catch (error) {
            return { stickyAdvIsShowing: false, error };
        }
    }

    async function ensureStickyBannerVisible() {
        if (!window.AdConfig?.stickyBannerEnabled) {
            return;
        }

        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement) {
            return;
        }

        try {
            if (bridge.advertisement.bannerState === "shown") {
                return;
            }

            await showBannerAdv();
        } catch (error) {
            void error;
        }
    }

    function startStickyBannerLoop() {
        window.clearInterval(sdkState.bannerTimerId);

        if (!window.AdConfig?.stickyBannerEnabled) {
            return;
        }

        ensureStickyBannerVisible();
        const recheckMs = Math.max(10000, Number(window.AdConfig?.stickyBannerRecheckMs) || 60000);
        sdkState.bannerTimerId = window.setInterval(() => {
            ensureStickyBannerVisible();
        }, recheckMs);
    }

    async function showRewardedVideo() {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.advertisement?.showRewarded) {
            return { shown: false, rewarded: false, local: true };
        }

        if (!bridge.advertisement.isRewardedSupported) {
            return { shown: false, rewarded: false, local: false };
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
                }

                if (state === "closed" || state === "failed") {
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

    async function submitLeaderboardScore(score, extraData) {
        void extraData;
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.leaderboards?.setScore) {
            return false;
        }

        const allowed = await isAvailableMethod("leaderboards.setScore");
        if (!allowed) {
            return false;
        }

        try {
            await bridge.leaderboards.setScore(
                window.Base.leaderboardName,
                Math.max(0, Math.floor(Number(score) || 0))
            );
            return true;
        } catch (error) {
            console.warn("Leaderboard setScore failed.", error);
            return false;
        }
    }

    async function getLeaderboardEntries(options) {
        void options;
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.leaderboards?.getEntries) {
            return null;
        }

        if (bridge.leaderboards.type !== "in_game") {
            return null;
        }

        try {
            const list = await bridge.leaderboards.getEntries(window.Base.leaderboardName);
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
        } catch (error) {
            console.warn("Leaderboard getEntries failed.", error);
            return null;
        }
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

    async function refreshIapCatalog() {
        sdkState.iapCatalogById = Object.create(null);
        sdkState.portalCurrencyImage = null;
        sdkState.portalCurrencyImageUrl = "";

        let bridgeList = [];

        const bridge = getBridge();
        if (bridge?.payments?.getCatalog && bridge.payments.isSupported && !sdkState.isLocalMode) {
            try {
                bridgeList = await bridge.payments.getCatalog();
            } catch (error) {
                console.warn("getCatalog failed, using static prices.", error);
            }
        }

        const merged = mergeCatalogRows(bridgeList);

        merged.forEach((product) => {
            if (product?.id) {
                sdkState.iapCatalogById[product.id] = product;
            }
        });
    }

    async function loadIapCatalogUiMedia() {
        await refreshIapCatalog();
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

    function isPaymentsSupported() {
        const bridge = getBridge();
        return Boolean(!sdkState.isLocalMode && bridge?.payments?.isSupported);
    }

    async function getPurchasesCatalog() {
        if (IAP_KNOWN_IDS.every((id) => !sdkState.iapCatalogById[id])) {
            await refreshIapCatalog();
        }

        return IAP_KNOWN_IDS.map((id) => sdkState.iapCatalogById[id]).filter(Boolean);
    }

    async function purchaseProduct(productId, developerPayload) {
        const bridge = getBridge();

        if (sdkState.isLocalMode || !bridge?.payments?.purchase || !productId) {
            return { success: false, local: sdkState.isLocalMode };
        }

        if (!bridge.payments.isSupported) {
            return { success: false, local: false };
        }

        gameplayStop();
        try {
            const pid = String(productId);
            const purchase = developerPayload
                ? await bridge.payments.purchase(pid, { developerPayload: String(developerPayload) })
                : await bridge.payments.purchase(pid);
            gameplayStart();
            const id = purchase?.id || productId;
            return {
                success: true,
                purchase: Object.assign({}, purchase, {
                    purchaseToken: id,
                    token: id,
                    productID: id,
                    productId: id
                })
            };
        } catch (error) {
            gameplayStart();
            console.warn("Purchase failed.", error);
            return { success: false, error };
        }
    }

    async function consumePurchase(productId) {
        if (sdkState.isLocalMode) {
            return false;
        }

        const bridge = getBridge();
        const id = String(productId || "").trim();

        if (!bridge?.payments?.consumePurchase || !id) {
            return false;
        }

        try {
            await bridge.payments.consumePurchase(id);
            return true;
        } catch (error) {
            console.warn("consumePurchase failed.", error);
            return false;
        }
    }

    async function claimPendingPurchases(grantCallback) {
        if (sdkState.isLocalMode) {
            return 0;
        }

        const bridge = getBridge();

        if (!bridge?.payments?.getPurchases) {
            return 0;
        }

        let claimed = 0;
        try {
            const purchases = await bridge.payments.getPurchases();
            const list = Array.isArray(purchases) ? purchases : [];

            for (let index = 0; index < list.length; index += 1) {
                const item = list[index];
                const productId = item?.id || item?.productID || item?.productId;

                if (!productId || typeof grantCallback !== "function") {
                    continue;
                }

                const granted = Boolean(grantCallback(productId, item));
                if (granted) {
                    claimed += 1;
                    await consumePurchase(productId);
                }
            }
        } catch (error) {
            console.warn("getPurchases failed.", error);
        }

        return claimed;
    }

    async function fetchRemoteFlags() {
        const bridge = getBridge();
        const defaults = (window.RemoteFlagsDefaultConfig && typeof window.RemoteFlagsDefaultConfig === "object")
            ? window.RemoteFlagsDefaultConfig
            : {};

        if (sdkState.isLocalMode || !bridge?.remoteConfig?.get || !bridge.remoteConfig.isSupported) {
            sdkState.remoteFlags = {};
            return sdkState.remoteFlags;
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

        try {
            const flags = await bridge.remoteConfig.get(options);
            const remote = flags && typeof flags === "object" ? flags : {};
            sdkState.remoteFlags = Object.assign({}, defaults, remote);
            applyRemoteFlags(sdkState.remoteFlags);
        } catch (error) {
            sdkState.remoteFlags = Object.assign({}, defaults);
            console.warn("Remote flags unavailable.", error);
        }

        return sdkState.remoteFlags;
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
        isPaymentsSupported,
        purchaseProduct,
        consumePurchase,
        claimPendingPurchases,
        fetchRemoteFlags,
        isAvailableMethod,
        refreshIapCatalog,
        attachDeferredBridgeListeners
    };
}());
