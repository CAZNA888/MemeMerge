(function () {
    "use strict";

    const BRIDGE_RETRY_SESSION_KEY = "bridge_retry_count";
    const BRIDGE_RETRY_DELAY_MS = 1800;
    const BRIDGE_RETRY_LIMIT = 3;
    const BRIDGE_MISSING_RETRY_ERROR = "bridge_missing_retry";

    function setLoadingMessage(titleElement, textElement, title, text) {
        if (titleElement) {
            titleElement.textContent = String(title || "");
        }

        if (textElement) {
            textElement.textContent = String(text || "");
        }
    }

    function scheduleBridgeReload(titleElement, textElement) {
        let retryCount = 0;

        try {
            retryCount = Number(window.sessionStorage?.getItem(BRIDGE_RETRY_SESSION_KEY)) || 0;
        } catch (error) {
            void error;
        }

        if (retryCount >= BRIDGE_RETRY_LIMIT) {
            setLoadingMessage(
                titleElement,
                textElement,
                "Проблемы с соединением",
                "Не удалось подключиться к сервису. Проверьте интернет и обновите страницу."
            );
            return;
        }

        try {
            window.sessionStorage?.setItem(BRIDGE_RETRY_SESSION_KEY, String(retryCount + 1));
        } catch (error) {
            void error;
        }

        setLoadingMessage(
            titleElement,
            textElement,
            "Проблемы с соединением",
            "Повторная загрузка..."
        );

        window.setTimeout(() => {
            window.location.reload();
        }, BRIDGE_RETRY_DELAY_MS);
    }

    function start() {
        window.GameAnalytics?.init?.(window.AnalyticsConfig?.yandexMetricaCounterId);
        const titleElement = document.getElementById("loading-title");
        const textElement = document.getElementById("loading-text");
        let loadingDotsTimerId = 0;

        window.GameSDK.init()
            .then(() => {
                const bridgeMissing = window.GameSDK?.state?.isLocalMode && !window.GameSDK?.state?.bridge;
                if (bridgeMissing) {
                    scheduleBridgeReload(titleElement, textElement);
                    throw new Error(BRIDGE_MISSING_RETRY_ERROR);
                }

                return Promise.resolve(window.GameSDK.loadSave())
                    .catch((error) => {
                        void error;
                        return null;
                    });
            })
            .then((peekSave) => {
                const bootLang = window.GameLocalization.resolveInitialLanguage([
                    window.GameSDK.getPreferredLanguage(),
                    peekSave?.settings?.language,
                    window.navigator?.language
                ]);

                window.Base.defaultLanguage = bootLang;

                if (titleElement && textElement && window.GameLocalization && window.Base) {
                    titleElement.textContent = window.GameUtils.translate("base.game_title", null, bootLang);
                    const baseLoadingText = window.GameUtils.translate("base.loading", null, bootLang).replace(/\.*$/u, "");
                    textElement.textContent = baseLoadingText + "...";
                    loadingDotsTimerId = window.setInterval(() => {
                        const current = textElement.textContent || baseLoadingText;
                        const withoutDots = current.replace(/\.*$/u, "");
                        const nextCount = ((current.length - withoutDots.length) % 3) + 1;
                        textElement.textContent = withoutDots + ".".repeat(nextCount);
                    }, 500);
                }

                return window.Game.init();
            })
            .then(() => {
                window.GameAnalytics?.sessionStart?.({
                    platform: window.GameSDK?.state?.bridge?.platform?.id || (window.GameSDK?.state?.isLocalMode ? "local" : "unknown")
                });
                return window.GameSDK.refreshIapCatalog();
            })
            .then(() => {
                if (window.GameState?.settings?.language) {
                    window.Base.defaultLanguage =
                        window.GameLocalization?.normalizeLanguageCode?.(window.GameState.settings.language) ||
                        window.GameState.settings.language;
                }

                return window.GameAssets.load((progress) => {
                    window.GameUI.setLoadingProgress(progress);
                });
            })
            .then(() => {
                window.GameSDK.attachDeferredBridgeListeners();
                window.GameUI.init();
                try {
                    window.sessionStorage?.removeItem(BRIDGE_RETRY_SESSION_KEY);
                } catch (error) {
                    void error;
                }

                window.setTimeout(() => {
                    if (loadingDotsTimerId) {
                        window.clearInterval(loadingDotsTimerId);
                        loadingDotsTimerId = 0;
                    }
                    window.GameUI.hideLoading();
                    window.GameSDK.ready();
                    window.GameSDK.gameplayStart();
                    window.GameAnalytics?.markGameReady?.();
                }, window.Base.loadingMinDurationMs);
            })
            .catch((error) => {
                if (error?.message === BRIDGE_MISSING_RETRY_ERROR) {
                    return;
                }

                console.error("Bootstrap failed.", error);
                setLoadingMessage(
                    titleElement,
                    textElement,
                    "Ошибка запуска",
                    "Не удалось запустить игру. Обновите страницу."
                );
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
}());
