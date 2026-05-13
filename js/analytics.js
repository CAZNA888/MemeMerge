(function () {
    "use strict";

    const STORAGE_KEY = "meme_brawl_analytics_v1";
    const MS_IN_DAY = 24 * 60 * 60 * 1000;

    const runtime = {
        sessionStartedAtMs: 0,
        gameReadyReported: false,
        interactiveReported: false,
        bootstrapStartedAtMs: Date.now(),
        fps: {
            elapsedMs: 0,
            frameCount: 0,
            min: Number.POSITIVE_INFINITY,
            max: 0,
            sum: 0,
            reportsSent: 0
        }
    };

    const state = loadState();

    function createDefaultState() {
        return {
            userId: "u_" + Math.random().toString(36).slice(2, 12),
            firstSeenAtMs: Date.now(),
            lastSeenAtMs: 0,
            sessionsCount: 0,
            totalRevenue: 0,
            purchasesCount: 0,
            isPayer: false,
            ads: {
                banner: 0,
                interstitial: 0,
                rewarded: 0
            },
            retentionSent: {}
        };
    }

    function loadState() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return createDefaultState();
            }
            const parsed = JSON.parse(raw);
            return Object.assign(createDefaultState(), parsed, {
                ads: Object.assign(createDefaultState().ads, parsed?.ads || {}),
                retentionSent: Object.assign({}, parsed?.retentionSent || {})
            });
        } catch (error) {
            void error;
            return createDefaultState();
        }
    }

    function persistState() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            void error;
        }
    }

    function getDayIndexFromFirstSeen(tsMs) {
        return Math.max(0, Math.floor((tsMs - state.firstSeenAtMs) / MS_IN_DAY));
    }

    function detectTrafficSource() {
        const url = new URL(window.location.href);
        const utmSource = url.searchParams.get("utm_source");
        if (utmSource) {
            return "utm:" + utmSource;
        }

        if (document.referrer) {
            try {
                const ref = new URL(document.referrer);
                return "ref:" + ref.hostname;
            } catch (error) {
                void error;
            }
        }

        return "direct";
    }

    function trackGoal(name, params) {
        void name;
        void params;
    }

    function flushQueue() {
    }

    function reportRetentionMilestones(nowMs) {
        const dayIndex = getDayIndexFromFirstSeen(nowMs);
        const milestones = [
            { key: "d1", day: 1, event: "retention_d1" },
            { key: "d3", day: 3, event: "retention_d3" },
            { key: "d7", day: 7, event: "retention_d7" },
            { key: "d14", day: 14, event: "retention_d14" }
        ];

        milestones.forEach((item) => {
            if (dayIndex >= item.day && !state.retentionSent[item.key]) {
                state.retentionSent[item.key] = true;
                trackGoal(item.event, {
                    day_index: dayIndex,
                    first_seen_at_ms: state.firstSeenAtMs
                });
            }
        });

        if (dayIndex >= 8 && dayIndex <= 14 && !state.retentionSent.w2) {
            state.retentionSent.w2 = true;
            trackGoal("retention_week2", { day_index: dayIndex });
        }

        if (dayIndex >= 30 && dayIndex <= 59 && !state.retentionSent.m2) {
            state.retentionSent.m2 = true;
            trackGoal("retention_month2", { day_index: dayIndex });
        }
    }

    function init() {
    }

    function sessionStart(extra) {
        const nowMs = Date.now();
        runtime.sessionStartedAtMs = nowMs;
        state.sessionsCount += 1;
        state.lastSeenAtMs = nowMs;
        persistState();

        reportRetentionMilestones(nowMs);

        trackGoal("session_start", Object.assign({
            traffic_source: detectTrafficSource(),
            day_index: getDayIndexFromFirstSeen(nowMs)
        }, extra || {}));

        flushQueue();
    }

    function sessionEnd(extra) {
        if (!runtime.sessionStartedAtMs) {
            return;
        }

        const durationSec = Math.max(0, Math.round((Date.now() - runtime.sessionStartedAtMs) / 1000));
        trackGoal("session_end", Object.assign({
            session_duration_sec: durationSec
        }, extra || {}));
    }

    function markGameReady() {
        if (runtime.gameReadyReported) {
            return;
        }

        runtime.gameReadyReported = true;
        const gameReadyMs = Math.max(0, Date.now() - runtime.bootstrapStartedAtMs);
        trackGoal("game_ready", { game_ready_ms: gameReadyMs });
    }

    function markInteractive() {
        if (runtime.interactiveReported) {
            return;
        }

        runtime.interactiveReported = true;
        const ttiMs = Math.max(0, Date.now() - runtime.bootstrapStartedAtMs);
        trackGoal("time_to_interactive", { tti_ms: ttiMs });
    }

    function reportAdImpression(adType, params) {
        const type = String(adType || "").toLowerCase();
        if (!type || !(type in state.ads)) {
            return;
        }

        state.ads[type] += 1;
        persistState();

        trackGoal("ad_impression", Object.assign({
            ad_type: type,
            ad_impressions_total: state.ads[type]
        }, params || {}));
    }

    function reportRewardGranted(params) {
        trackGoal("reward_granted", params || {});
    }

    function reportPurchaseAttempt(productId, params) {
        trackGoal("purchase_attempt", Object.assign({
            product_id: String(productId || "")
        }, params || {}));
    }

    function reportPurchaseSuccess(productId, amount, currencyCode, params) {
        const normalizedAmount = Number(amount);
        const revenue = Number.isFinite(normalizedAmount) ? Math.max(0, normalizedAmount) : 0;
        const wasPayer = state.isPayer;

        state.purchasesCount += 1;
        state.totalRevenue += revenue;
        state.isPayer = state.isPayer || revenue > 0;
        persistState();

        trackGoal("purchase_success", Object.assign({
            product_id: String(productId || ""),
            revenue_value: revenue,
            revenue_total: Number(state.totalRevenue.toFixed(4)),
            purchases_total: state.purchasesCount,
            is_first_payer: !wasPayer && state.isPayer,
            currency: String(currencyCode || "")
        }, params || {}));
    }

    function reportFps(deltaSeconds) {
        const safeDelta = Number(deltaSeconds);
        if (!Number.isFinite(safeDelta) || safeDelta <= 0) {
            return;
        }

        const fpsValue = 1 / safeDelta;
        if (!Number.isFinite(fpsValue) || fpsValue <= 0) {
            return;
        }

        runtime.fps.frameCount += 1;
        runtime.fps.elapsedMs += safeDelta * 1000;
        runtime.fps.min = Math.min(runtime.fps.min, fpsValue);
        runtime.fps.max = Math.max(runtime.fps.max, fpsValue);
        runtime.fps.sum += fpsValue;

        if (runtime.fps.elapsedMs < 60000) {
            return;
        }

        const avg = runtime.fps.sum / Math.max(1, runtime.fps.frameCount);
        trackGoal("fps_snapshot", {
            fps_avg: Number(avg.toFixed(2)),
            fps_min: Number(runtime.fps.min.toFixed(2)),
            fps_max: Number(runtime.fps.max.toFixed(2)),
            sample_ms: Math.round(runtime.fps.elapsedMs),
            sample_index: runtime.fps.reportsSent + 1
        });

        runtime.fps.elapsedMs = 0;
        runtime.fps.frameCount = 0;
        runtime.fps.min = Number.POSITIVE_INFINITY;
        runtime.fps.max = 0;
        runtime.fps.sum = 0;
        runtime.fps.reportsSent += 1;
    }

    function onBeforeUnload() {
        const playTimeSec = Number(window.GameState?.stats?.playTimeSeconds) || 0;
        sessionEnd({ play_time_total_sec: playTimeSec });
    }

    window.addEventListener("pagehide", onBeforeUnload);
    window.addEventListener("beforeunload", onBeforeUnload);

    window.GameAnalytics = {
        state,
        init,
        sessionStart,
        sessionEnd,
        markGameReady,
        markInteractive,
        reportAdImpression,
        reportRewardGranted,
        reportPurchaseAttempt,
        reportPurchaseSuccess,
        reportFps,
        trackGoal
    };
}());
