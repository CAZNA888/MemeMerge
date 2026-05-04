(async function () {
    "use strict";

    async function start() {
        const titleElement = document.getElementById("loading-title");
        const textElement = document.getElementById("loading-text");
        let loadingDotsTimerId = 0;

        await window.GameSDK.init();

        let peekSave = null;

        try {
            peekSave = await window.GameSDK.loadSave();
        } catch (error) {
            void error;
        }

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

        await window.Game.init();
        await window.GameSDK.refreshIapCatalog();

        if (window.GameState?.settings?.language) {
            window.Base.defaultLanguage =
                window.GameLocalization?.normalizeLanguageCode?.(window.GameState.settings.language) ||
                window.GameState.settings.language;
        }

        await window.GameAssets.load((progress) => {
            window.GameUI.setLoadingProgress(progress);
        });
        window.GameSDK.attachDeferredBridgeListeners();
        window.GameUI.init();

        window.setTimeout(() => {
            if (loadingDotsTimerId) {
                window.clearInterval(loadingDotsTimerId);
                loadingDotsTimerId = 0;
            }
            window.GameUI.hideLoading();
            window.GameSDK.ready();
            window.GameSDK.gameplayStart();
        }, window.Base.loadingMinDurationMs);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
}());
