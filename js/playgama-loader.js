(function () {
    "use strict";

    const CDN_SCRIPT_URL = "https://bridge.playgama.com/v1/stable/playgama-bridge.js";
    const LOCAL_SCRIPT_URL = "vendor/playgama-bridge/playgama-bridge.js";
    const CDN_TIMEOUT_MS = 2000;

    const state = {
        source: "",
        error: null
    };

    function getBridge() {
        return window.bridge || window.playgamaBridge || null;
    }

    function loadScript(src, timeoutMs) {
        return new Promise((resolve, reject) => {
            if (getBridge()) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            let finished = false;
            let timeoutId = 0;

            function cleanup(shouldRemove) {
                window.clearTimeout(timeoutId);
                script.onload = null;
                script.onerror = null;

                if (shouldRemove && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }

            function done(callback, shouldRemove) {
                if (finished) {
                    return;
                }

                finished = true;
                cleanup(Boolean(shouldRemove));
                callback();
            }

            script.async = true;
            script.src = src;
            script.onload = () => {
                done(resolve, false);
            };
            script.onerror = () => {
                done(() => reject(new Error("Failed to load Playgama Bridge: " + src)), true);
            };

            if (timeoutMs > 0) {
                timeoutId = window.setTimeout(() => {
                    done(() => reject(new Error("Playgama Bridge CDN timeout")), true);
                }, timeoutMs);
            }

            document.head.appendChild(script);
        });
    }

    const ready = loadScript(CDN_SCRIPT_URL, CDN_TIMEOUT_MS)
        .then(() => {
            state.source = "cdn";
            return state;
        })
        .catch((error) => {
            console.warn("CDN bridge failed to load within 2 seconds, loading local bridge.", error);
            state.error = error;
            return loadScript(LOCAL_SCRIPT_URL, 0).then(() => {
                state.source = "local";
                return state;
            });
        });

    window.PlaygamaBridgeLoader = {
        CDN_SCRIPT_URL,
        LOCAL_SCRIPT_URL,
        CDN_TIMEOUT_MS,
        state,
        ready
    };
}());
