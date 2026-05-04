(function () {
    "use strict";

    const BRAWLER_RADIUS = 84;
    const MERGE_DISTANCE = 100;
    const DRAG_THRESHOLD = 8;
    const FIELD_PADDING = 82;
    const MERGE_EFFECT_DURATION = 0.65;
    const UPGRADE_CARD_HEIGHT = 150;
    const BATTLE_TEAM_SIZE = 3;

    const uiState = {
        canvas: null,
        context: null,
        width: 1280,
        height: 720,
        cssWidth: 1280,
        cssHeight: 720,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        frameId: 0,
        lastTime: 0,
        pointer: {
            x: 0,
            y: 0,
            isDown: false,
            id: null
        },
        drag: {
            brawlerId: null,
            offsetX: 0,
            offsetY: 0,
            startX: 0,
            startY: 0,
            startPointerX: 0,
            startPointerY: 0,
            hasMoved: false
        },
        mergeEffects: [],
        clickEffects: [],
        coinFlyEffects: [],
        activePanel: null,
        panel: {
            scrollY: 0,
            isScrolling: false,
            lastPointerY: 0,
            volumeSliderKey: null,
            lastSliderSoundAt: 0,
            shopTab: "upgrades",
            inAppsPurchasePendingId: null
        },
        leaderboard: {
            entries: [],
            isLoading: false,
            requestedAt: 0
        },
        boxOpening: {
            active: false,
            source: null,
            startedAt: 0,
            spinDuration: 5,
            reelTypes: [],
            finalType: null,
            stopOffset: 0,
            lastSlotTickIndex: -1,
            revealed: false,
            canClose: false,
            spawnPosition: null,
            requestInProgress: false
        },
        battle: {
            phase: "idle",
            selectedIds: [],
            selectScrollY: 0,
            matchPreview: null,
            playerTeam: [],
            enemyTeam: [],
            projectiles: [],
            impacts: [],
            damageTexts: [],
            introStartedAt: 0,
            introElapsedMs: 0,
            lastAttackAt: 0,
            attackAccumulatorMs: 0,
            elapsedMs: 0,
            result: null,
            cameraShake: 0,
            playerName: "Player",
            enemyName: "Player",
            enemyCups: 0,
            difficultyTier: "medium",
            difficultyPowerMultiplier: 1,
            resultStreak: 0,
            cooldownUntilMs: 0,
            skipCooldownPending: false
        },
        performance: {
            tier: 0,
            framesInSample: 0,
            sampleElapsedMs: 0,
            lastTierChangeMs: 0
        },
        renderDpr: 1
    };

    function detectMobile() {
        try {
            if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
                return true;
            }
        } catch (error) {
            void error;
        }

        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
    }

    function isReduceAnimations() {
        return Boolean(window.GameState?.settings?.reduceAnimations);
    }

    function getReduceAnimationsPerformanceOverlay() {
        if (!isReduceAnimations()) {
            return null;
        }

        return {
            maxCoinFly: 0,
            maxClickEffects: 0,
            maxMergeEffects: 0,
            maxBattleImpacts: 2,
            maxBattleDamageTexts: 4,
            bubbleCountMenu: 0,
            bubbleCountBattle: 0,
            boxBubbleCount: 0,
            drawProjectileTrail: false,
            impactDetail: "minimal",
            coinBurstMin: 0,
            coinBurstMax: 0,
            coinGlow: false,
            mergeSparkCount: 0
        };
    }

    function getCappedDevicePixelRatio() {
        const raw = window.devicePixelRatio || 1;
        const cfg = window.PerformanceConfig;

        if (!cfg) {
            return raw;
        }

        let cap = detectMobile()
            ? (cfg.mobileMaxDevicePixelRatio ?? 1.5)
            : (cfg.desktopMaxDevicePixelRatio ?? 2);

        if (isReduceAnimations()) {
            const reducedCap = detectMobile()
                ? (cfg.reducedAnimationsMobileMaxDpr ?? 1)
                : (cfg.reducedAnimationsDesktopMaxDpr ?? 1.25);
            cap = Math.min(cap, reducedCap);
        }

        return Math.min(raw, cap);
    }

    function getPerformanceLimits() {
        const cfg = window.PerformanceConfig;
        const fallback = {
            maxCoinFly: 24,
            maxClickEffects: 12,
            maxMergeEffects: 8,
            maxBattleImpacts: 14,
            maxBattleDamageTexts: 14,
            bubbleCountMenu: 44,
            bubbleCountBattle: 36,
            boxBubbleCount: 26,
            drawProjectileTrail: true,
            impactDetail: "full",
            coinBurstMin: 1,
            coinBurstMax: 5,
            coinGlow: true,
            mergeSparkCount: 14
        };

        if (!cfg || !Array.isArray(cfg.tiers) || cfg.tiers.length === 0) {
            return fallback;
        }

        const tier = window.GameUtils.clamp(
            uiState.performance.tier,
            0,
            cfg.tiers.length - 1
        );

        const baseLimits = Object.assign({}, fallback, cfg.tiers[tier]);
        const overlay = getReduceAnimationsPerformanceOverlay();

        return overlay ? Object.assign({}, baseLimits, overlay) : baseLimits;
    }

    function initPerformanceTier() {
        const cfg = window.PerformanceConfig;

        if (!cfg || !Array.isArray(cfg.tiers) || cfg.tiers.length === 0) {
            return;
        }

        const mobile = detectMobile();
        const start = mobile ? (cfg.mobileStartTier ?? 1) : (cfg.desktopStartTier ?? 0);

        uiState.performance.tier = window.GameUtils.clamp(start, 0, cfg.tiers.length - 1);
        uiState.performance.lastTierChangeMs = performance.now();
    }

    function updateDynamicQuality(deltaSeconds) {
        const cfg = window.PerformanceConfig;

        if (!cfg || !Array.isArray(cfg.tiers) || cfg.tiers.length === 0 || !uiState.performance) {
            return;
        }

        const p = uiState.performance;
        const maxTier = cfg.tiers.length - 1;

        p.framesInSample += 1;
        p.sampleElapsedMs += deltaSeconds * 1000;

        if (p.sampleElapsedMs < (cfg.fpsSampleMs ?? 800)) {
            return;
        }

        const fps = p.framesInSample / (p.sampleElapsedMs / 1000);

        p.framesInSample = 0;
        p.sampleElapsedMs = 0;

        const now = performance.now();
        let newTier = p.tier;

        if (fps < (cfg.tierEmergencyFps ?? 26)) {
            newTier = maxTier;
        } else if (fps < (cfg.tierDownFps ?? 38) && p.tier < maxTier) {
            newTier = p.tier + 1;
        } else if (
            fps > (cfg.tierUpFps ?? 52) &&
            p.tier > 0 &&
            now - p.lastTierChangeMs >= (cfg.tierUpMinStableMs ?? 4500)
        ) {
            newTier = p.tier - 1;
        }

        newTier = window.GameUtils.clamp(newTier, 0, maxTier);

        if (newTier !== p.tier) {
            p.tier = newTier;
            p.lastTierChangeMs = now;
        }
    }

    function trimEffectArrays() {
        const L = getPerformanceLimits();

        while (uiState.clickEffects.length > L.maxClickEffects) {
            uiState.clickEffects.shift();
        }

        while (uiState.mergeEffects.length > L.maxMergeEffects) {
            uiState.mergeEffects.shift();
        }

        while (uiState.coinFlyEffects.length > L.maxCoinFly) {
            uiState.coinFlyEffects.shift();
        }
    }

    function trimBattleVisuals() {
        const L = getPerformanceLimits();

        while (uiState.battle.impacts.length > L.maxBattleImpacts) {
            uiState.battle.impacts.shift();
        }

        while (uiState.battle.damageTexts.length > L.maxBattleDamageTexts) {
            uiState.battle.damageTexts.shift();
        }
    }

    function init() {
        uiState.canvas = document.getElementById("game-canvas");
        uiState.context = uiState.canvas.getContext("2d");
        window.addEventListener("resize", resize);
        uiState.canvas.addEventListener("pointerdown", handlePointerDown);
        uiState.canvas.addEventListener("pointermove", handlePointerMove);
        uiState.canvas.addEventListener("pointerup", handlePointerUp);
        uiState.canvas.addEventListener("pointercancel", handlePointerCancel);
        uiState.canvas.addEventListener("wheel", handleWheel, { passive: false });
        resize();
        initPerformanceTier();
        startRenderLoop();
    }

    function resize() {
        const rect = uiState.canvas.getBoundingClientRect();
        const renderDpr = getCappedDevicePixelRatio();

        uiState.renderDpr = renderDpr;
        uiState.width = Math.floor(rect.width * renderDpr);
        uiState.height = Math.floor(rect.height * renderDpr);
        uiState.cssWidth = rect.width;
        uiState.cssHeight = rect.height;
        uiState.canvas.width = uiState.width;
        uiState.canvas.height = uiState.height;
        uiState.context.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
        uiState.scale = Math.min(rect.width / window.Base.designWidth, rect.height / window.Base.designHeight);
        uiState.offsetX = (rect.width - window.Base.designWidth * uiState.scale) / 2;
        uiState.offsetY = (rect.height - window.Base.designHeight * uiState.scale) / 2;
    }

    function startRenderLoop() {
        window.cancelAnimationFrame(uiState.frameId);

        function tick(time) {
            if (window.GameAssets?.isAppSuspended?.()) {
                uiState.lastTime = time;
                uiState.frameId = window.requestAnimationFrame(tick);
                return;
            }

            const deltaSeconds = Math.min(0.05, (time - uiState.lastTime) / 1000 || 0);
            uiState.lastTime = time;
            render(time / 1000, deltaSeconds);
            uiState.frameId = window.requestAnimationFrame(tick);
        }

        uiState.frameId = window.requestAnimationFrame(tick);
    }

    function getPointerPosition(event) {
        const rect = uiState.canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left - uiState.offsetX) / uiState.scale,
            y: (event.clientY - rect.top - uiState.offsetY) / uiState.scale
        };
    }

    function handlePointerDown(event) {
        const position = getPointerPosition(event);

        window.GameAssets.startBackgroundMusic();
        uiState.pointer.x = position.x;
        uiState.pointer.y = position.y;
        uiState.pointer.isDown = true;
        uiState.pointer.id = event.pointerId;

        if (uiState.boxOpening.active) {
            event.preventDefault();
            return;
        }

        if (uiState.battle.phase !== "idle") {
            event.preventDefault();
            return;
        }

        if (uiState.activePanel === "settings" && startVolumeSliderInteraction(position)) {
            uiState.canvas.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }

        const scrollViewport = getActiveScrollViewportRect();

        if (scrollViewport && isInside(position, scrollViewport) && shouldStartPanelScroll(position)) {
            uiState.panel.isScrolling = true;
            uiState.panel.lastPointerY = position.y;
            uiState.canvas.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }

        if (uiState.activePanel) {
            event.preventDefault();
            return;
        }

        const brawler = findTopBrawlerAt(position);

        if (brawler) {
            uiState.drag.brawlerId = brawler.id;
            uiState.drag.offsetX = brawler.x - position.x;
            uiState.drag.offsetY = brawler.y - position.y;
            uiState.drag.startX = brawler.x;
            uiState.drag.startY = brawler.y;
            uiState.drag.startPointerX = position.x;
            uiState.drag.startPointerY = position.y;
            uiState.drag.hasMoved = false;
            uiState.canvas.setPointerCapture?.(event.pointerId);
            event.preventDefault();
        }
    }

    function handlePointerMove(event) {
        const position = getPointerPosition(event);
        uiState.pointer.x = position.x;
        uiState.pointer.y = position.y;

        if (uiState.panel.volumeSliderKey) {
            updateVolumeSlider(uiState.panel.volumeSliderKey, position.x);
            event.preventDefault();
            return;
        }

        if (uiState.panel.isScrolling) {
            scrollActivePanel(uiState.panel.lastPointerY - position.y);
            uiState.panel.lastPointerY = position.y;
            event.preventDefault();
            return;
        }

        if (!uiState.drag.brawlerId) {
            return;
        }

        const distance = getDistance(position, {
            x: uiState.drag.startPointerX,
            y: uiState.drag.startPointerY
        });
        const nextPosition = clampBrawlerPosition({
            x: position.x + uiState.drag.offsetX,
            y: position.y + uiState.drag.offsetY
        });

        uiState.drag.hasMoved = uiState.drag.hasMoved || distance > DRAG_THRESHOLD;
        window.Game.moveBrawler(uiState.drag.brawlerId, nextPosition.x, nextPosition.y, false);
        event.preventDefault();
    }

    function handlePointerUp(event) {
        const position = getPointerPosition(event);
        const hadDraggedBrawler = Boolean(uiState.drag.brawlerId);

        uiState.pointer.x = position.x;
        uiState.pointer.y = position.y;
        uiState.pointer.isDown = false;
        uiState.pointer.id = null;

        if (uiState.boxOpening.active) {
            handleBoxOpeningClick(position);
            event.preventDefault();
            return;
        }

        if (uiState.panel.volumeSliderKey) {
            uiState.panel.volumeSliderKey = null;
            uiState.canvas.releasePointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }

        if (uiState.panel.isScrolling) {
            uiState.panel.isScrolling = false;
            uiState.canvas.releasePointerCapture?.(event.pointerId);
            if (Math.abs(uiState.panel.lastPointerY - position.y) > 4) {
                event.preventDefault();
                return;
            }
        }

        if (hadDraggedBrawler) {
            finishBrawlerDrag();
            uiState.canvas.releasePointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }

        if (uiState.battle.phase !== "idle") {
            handleBattleClick(position);
            return;
        }

        if (handlePanelClick(position)) {
            return;
        }

        if (uiState.activePanel) {
            return;
        }

        if (handleTopBarClick(position)) {
            return;
        }

        if (handleMenuButtonClick(position)) {
            return;
        }

        if (handleCharacterOfferClick(position)) {
            return;
        }

        handleBottomBoxesClick(position);

    }

    function handlePointerCancel(event) {
        if (uiState.drag.brawlerId) {
            const startPosition = clampBrawlerPosition({
                x: uiState.drag.startX,
                y: uiState.drag.startY
            });

            window.Game.moveBrawler(uiState.drag.brawlerId, startPosition.x, startPosition.y, false);
            resetDrag();
        }

        uiState.panel.isScrolling = false;
        uiState.panel.volumeSliderKey = null;
        uiState.pointer.isDown = false;
        uiState.pointer.id = null;
        uiState.canvas.releasePointerCapture?.(event.pointerId);
    }

    function handleWheel(event) {
        if (uiState.battle.phase === "select" || uiState.battle.phase === "preview") {
            uiState.battle.selectScrollY = window.GameUtils.clamp(
                uiState.battle.selectScrollY + event.deltaY,
                0,
                getBattleSelectionMaxScrollY()
            );
            event.preventDefault();
            return;
        }

        if (!uiState.activePanel) {
            return;
        }

        scrollActivePanel(event.deltaY);
        event.preventDefault();
    }

    function resetDrag() {
        uiState.drag.brawlerId = null;
        uiState.drag.offsetX = 0;
        uiState.drag.offsetY = 0;
        uiState.drag.startX = 0;
        uiState.drag.startY = 0;
        uiState.drag.startPointerX = 0;
        uiState.drag.startPointerY = 0;
        uiState.drag.hasMoved = false;
    }

    function finishBrawlerDrag() {
        const brawler = window.Game.findBrawlerById(uiState.drag.brawlerId);

        if (!brawler) {
            resetDrag();
            return;
        }

        if (!uiState.drag.hasMoved) {
            handleBrawlerClick(brawler);
            resetDrag();
            return;
        }

        const mergeTarget = findMergeTarget(brawler);

        if (mergeTarget) {
            const mergedBrawler = window.Game.mergeBrawlers(brawler.id, mergeTarget.id);

            if (mergedBrawler) {
                addMergeEffect(mergedBrawler.x, mergedBrawler.y);
                window.GameAssets.playSound("merge");
                resetDrag();
                return;
            }
        }

        const position = clampBrawlerPosition(brawler);
        window.Game.moveBrawler(brawler.id, position.x, position.y, true);
        resetDrag();
    }

    function isInside(point, rect) {
        return point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height;
    }

    function getDistance(first, second) {
        return Math.hypot(first.x - second.x, first.y - second.y);
    }

    function clampBrawlerPosition(position) {
        const field = getCenterFieldRect();

        return {
            x: window.GameUtils.clamp(position.x, field.x + FIELD_PADDING, field.x + field.width - FIELD_PADDING),
            y: window.GameUtils.clamp(position.y, field.y + FIELD_PADDING, field.y + field.height - FIELD_PADDING)
        };
    }

    function findTopBrawlerAt(position) {
        for (let index = window.GameState.brawlers.length - 1; index >= 0; index -= 1) {
            const brawler = window.GameState.brawlers[index];

            if (getDistance(position, brawler) <= BRAWLER_RADIUS) {
                return brawler;
            }
        }

        return null;
    }

    function findMergeTarget(source) {
        let closestTarget = null;
        let closestDistance = MERGE_DISTANCE;

        window.GameState.brawlers.forEach((candidate) => {
            const distance = getDistance(source, candidate);

            if (distance <= closestDistance && window.Game.canMergeBrawlers(source, candidate)) {
                closestTarget = candidate;
                closestDistance = distance;
            }
        });

        return closestTarget;
    }

    function addMergeEffect(x, y) {
        if ((getPerformanceLimits().maxMergeEffects || 0) <= 0) {
            return;
        }

        uiState.mergeEffects.push({
            x,
            y,
            startedAt: performance.now() / 1000
        });
        trimEffectArrays();
    }

    function handleBrawlerClick(brawler) {
        const reward = window.Game.collectBrawlerClickReward(brawler.id);

        if (reward <= 0) {
            return;
        }

        addClickRewardEffect(brawler.x, brawler.y - 72, reward);
        const L = getPerformanceLimits();
        const coinBurstMax = Math.max(0, L.coinBurstMax ?? 5);
        const coinBurstMin = Math.min(Math.max(0, L.coinBurstMin ?? 1), coinBurstMax);
        const coinBurstCount = coinBurstMax < 1 ? 0 : window.GameUtils.randomInt(coinBurstMin, coinBurstMax);
        window.GameAssets.playSound("coin-scatter");
        for (let index = 0; index < coinBurstCount; index += 1) {
            addCoinFlyEffect(brawler.x, brawler.y - 36);
        }
        window.GameAssets.playSound("click");
    }

    function addClickRewardEffect(x, y, amount) {
        if ((getPerformanceLimits().maxClickEffects || 0) <= 0) {
            return;
        }

        uiState.clickEffects.push({
            x,
            y,
            amount,
            startedAt: performance.now() / 1000
        });
        trimEffectArrays();
    }

    function addCoinFlyEffect(x, y) {
        if ((getPerformanceLimits().maxCoinFly || 0) <= 0) {
            return;
        }

        const driftDistance = window.GameUtils.randomInt(220, 560);
        const driftAngle = Math.random() * Math.PI * 2;
        const orbitDuration = window.GameUtils.randomInt(2000, 3000) / 1000;
        uiState.coinFlyEffects.push({
            x,
            y,
            startedAt: performance.now() / 1000,
            driftX: Math.cos(driftAngle) * driftDistance,
            driftY: Math.sin(driftAngle) * driftDistance * 0.75,
            wobbleAmplitude: window.GameUtils.randomInt(8, 20),
            wobbleSpeed: 1.4 + Math.random() * 2.6,
            orbitDuration,
            flyDuration: 0.72 + Math.random() * 0.22,
            size: window.GameUtils.randomInt(39, 52),
            spinAngle: Math.random() * Math.PI * 2,
            spinSpeed: (Math.random() * 5 + 4) * (Math.random() < 0.5 ? -1 : 1)
        });
        trimEffectArrays();
    }

    function getCharacterOfferRect() {
        return {
            x: 754,
            y: 570,
            width: 210,
            height: 104
        };
    }

    function getProgressBoxRect() {
        return { x: 20, y: 568, width: 190, height: 124 };
    }

    function getAdBoxRect() {
        return { x: 232, y: 568, width: 178, height: 124 };
    }

    function getBattleButtonRect() {
        return { x: 1002, y: 562, width: 224, height: 112 };
    }

    function getBattleSkipRect() {
        const battleRect = getBattleButtonRect();
        return {
            x: battleRect.x + 14,
            y: battleRect.y + 68,
            width: battleRect.width - 28,
            height: 32
        };
    }

    function getBattleCooldownRemainingMs() {
        return Math.max(0, (Number(uiState.battle.cooldownUntilMs) || 0) - Date.now());
    }

    function isBattleOnCooldown() {
        return getBattleCooldownRemainingMs() > 0;
    }

    function formatCooldownTime(totalMs) {
        const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    function getRandomFieldPosition() {
        const field = getCenterFieldRect();

        return {
            x: window.GameUtils.randomInt(field.x + FIELD_PADDING, field.x + field.width - FIELD_PADDING),
            y: window.GameUtils.randomInt(field.y + FIELD_PADDING, field.y + field.height - FIELD_PADDING)
        };
    }

    function handleCharacterOfferClick(position) {
        if (!isInside(position, getCharacterOfferRect())) {
            return false;
        }

        const offeredBrawler = window.BrawlerConfig[0];
        const spawnPosition = getRandomFieldPosition();
        const brawler = window.Game.buyBrawler(offeredBrawler.type, spawnPosition.x, spawnPosition.y);

        if (brawler) {
            window.GameAssets.playSound("button");
        }

        return true;
    }

    function handleBottomBoxesClick(position) {
        if (isBattleOnCooldown() && isInside(position, getBattleSkipRect())) {
            if (uiState.battle.skipCooldownPending) {
                return true;
            }

            uiState.battle.skipCooldownPending = true;
            window.GameSDK.showRewardedVideo()
                .then((result) => {
                    if (!result?.rewarded) {
                        window.GameAssets.playSound("lose");
                        return;
                    }

                    uiState.battle.cooldownUntilMs = 0;
                    window.GameAssets.playSound("button");
                })
                .catch(() => {
                    window.GameAssets.playSound("lose");
                })
                .finally(() => {
                    uiState.battle.skipCooldownPending = false;
                });
            return true;
        }

        if (isInside(position, getBattleButtonRect())) {
            if (isBattleOnCooldown()) {
                window.GameAssets.playSound("lose");
                return true;
            }
            openBattleSelectionWithInterstitial();
            return true;
        }

        if (isInside(position, getProgressBoxRect())) {
            startBoxOpening("progress");
            return true;
        }

        if (isInside(position, getAdBoxRect())) {
            startBoxOpening("ad");
            return true;
        }

        return false;
    }

    function openBattleSelectionWithInterstitial() {
        if (uiState.battle.phase !== "idle" || uiState.boxOpening.active) {
            return;
        }

        window.GameSDK.showFullscreenAdv()
            .catch(() => null)
            .finally(() => {
                openBattleSelectionPanel();
            });
    }

    function startBoxOpening(source) {
        if (uiState.boxOpening.active || uiState.boxOpening.requestInProgress) {
            return;
        }

        const safeSource = source === "progress" ? "progress" : "ad";

        if (safeSource === "ad") {
            uiState.boxOpening.requestInProgress = true;
            window.GameSDK.showRewardedVideo()
                .then((result) => {
                    if (!result?.rewarded) {
                        window.GameAssets.playSound("lose");
                        return;
                    }

                    const reward = window.Game.claimBoxReward("ad");
                    openBoxRewardOverlay(reward);
                })
                .catch(() => {
                    window.GameAssets.playSound("lose");
                })
                .finally(() => {
                    uiState.boxOpening.requestInProgress = false;
                });
            return;
        }

        const reward = window.Game.claimBoxReward("progress");
        openBoxRewardOverlay(reward);
    }

    function openBoxRewardOverlay(reward) {
        if (!reward || !reward.rewardTypes || reward.rewardTypes.length === 0) {
            window.GameAssets.playSound("lose");
            return;
        }

        const reelTypes = createShuffledReelTypes();
        const itemWidth = 154;
        const centerIndex = 4;
        const stopIndex = window.GameUtils.randomInt(centerIndex + 8, reelTypes.length - 6);
        const stopOffset = stopIndex * itemWidth - centerIndex * itemWidth;
        const targetType = reward.rewardTypes[0] || reelTypes[stopIndex];

        reelTypes[stopIndex] = targetType;

        uiState.boxOpening.active = true;
        uiState.boxOpening.source = reward.source;
        uiState.boxOpening.startedAt = performance.now() / 1000;
        uiState.boxOpening.reelTypes = reelTypes;
        uiState.boxOpening.finalType = null;
        uiState.boxOpening.stopOffset = stopOffset;
        uiState.boxOpening.lastSlotTickIndex = -1;
        uiState.boxOpening.revealed = false;
        uiState.boxOpening.canClose = false;
        uiState.boxOpening.spawnPosition = getRandomFieldPosition();
        window.GameAssets.playSound("box");
    }

    function handleBoxOpeningClick() {
        if (!uiState.boxOpening.active || !uiState.boxOpening.canClose) {
            return;
        }

        const spawn = uiState.boxOpening.spawnPosition || getRandomFieldPosition();
        const rewards = [uiState.boxOpening.finalType || window.BrawlerConfig[0].type];

        rewards.forEach((type, index) => {
            const offsetX = index * 34;
            const offsetY = index * 20;
            const position = clampBrawlerPosition({
                x: spawn.x + offsetX,
                y: spawn.y + offsetY
            });
            window.Game.addBrawler(type, position.x, position.y, 1);
        });

        uiState.boxOpening.active = false;
        uiState.boxOpening.source = null;
        uiState.boxOpening.startedAt = 0;
        uiState.boxOpening.reelTypes = [];
        uiState.boxOpening.finalType = null;
        uiState.boxOpening.stopOffset = 0;
        uiState.boxOpening.lastSlotTickIndex = -1;
        uiState.boxOpening.revealed = false;
        uiState.boxOpening.canClose = false;
        uiState.boxOpening.spawnPosition = null;
        window.GameAssets.playSound("button");
    }

    function openBattleSelectionPanel() {
        if (!Array.isArray(window.GameState?.brawlers) || window.GameState.brawlers.length < 2) {
            window.GameAssets.playSound("lose");
            return;
        }

        uiState.activePanel = null;
        uiState.battle.phase = "select";
        uiState.battle.selectedIds = [];
        uiState.battle.selectScrollY = 0;
        uiState.battle.playerTeam = [];
        uiState.battle.enemyTeam = [];
        uiState.battle.projectiles = [];
        uiState.battle.result = null;
        window.GameAssets.playSound("button");
    }

    function getBattleSelectionBrawlers() {
        const brawlers = Array.isArray(window.GameState?.brawlers) ? window.GameState.brawlers.slice() : [];
        return brawlers.sort((left, right) => {
            const leftStats = window.Game.getBrawlerStats(left.type, left.level);
            const rightStats = window.Game.getBrawlerStats(right.type, right.level);
            const leftPower = leftStats.hp + leftStats.damage * 5;
            const rightPower = rightStats.hp + rightStats.damage * 5;

            if (rightPower !== leftPower) {
                return rightPower - leftPower;
            }

            if (right.level !== left.level) {
                return right.level - left.level;
            }

            return String(left.id).localeCompare(String(right.id));
        });
    }

    function getBattleSelectionCardRects() {
        const cards = [];
        const cardWidth = 184;
        const cardHeight = 220;
        const columns = 5;
        const gapX = 20;
        const gapY = 16;
        const startX = 128;
        const startY = 160;
        const brawlers = getBattleSelectionBrawlers();

        brawlers.forEach((_, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            cards.push({
                x: startX + column * (cardWidth + gapX),
                y: startY + row * (cardHeight + gapY),
                width: cardWidth,
                height: cardHeight
            });
        });

        return cards;
    }

    function getBattleSelectionViewportRect() {
        return { x: 106, y: 158, width: 1068, height: 438 };
    }

    function getBattleSelectionContentHeight() {
        const brawlers = getBattleSelectionBrawlers();
        const rows = Math.ceil(brawlers.length / 5);
        if (rows <= 0) {
            return 0;
        }
        const cardHeight = 220;
        const gapY = 16;
        return rows * cardHeight + Math.max(0, rows - 1) * gapY;
    }

    function getBattleSelectionMaxScrollY() {
        const viewport = getBattleSelectionViewportRect();
        return Math.max(0, getBattleSelectionContentHeight() - viewport.height);
    }

    function getBattleSelectCloseRect() {
        return { x: 1090, y: 88, width: 74, height: 56 };
    }

    function getBattlePlayRect() {
        return { x: 956, y: 620, width: 220, height: 72 };
    }

    function buildBattleFighterFromBrawler(brawler, side, slotIndex) {
        const stats = window.Game.getBrawlerStats(brawler.type, brawler.level);
        const leftX = [200, 310, 420];
        const rightX = [1080, 970, 860];
        const y = 220 + slotIndex * 160;

        return {
            id: brawler.id + "-" + side + "-" + slotIndex,
            type: brawler.type,
            level: brawler.level,
            nameKey: window.Game.getBrawlerConfig(brawler.type).nameKey,
            maxHp: Math.max(1, stats.hp),
            hp: Math.max(1, stats.hp),
            damage: Math.max(1, stats.damage),
            critChance: Math.max(0, stats.critChance || 0),
            side,
            x: side === "player" ? leftX[slotIndex] : rightX[slotIndex],
            y
        };
    }

    function createEnemyTemplate(levelOffsetMin, levelOffsetMax, slotIndex) {
        const baseConfig = window.BrawlerConfig[window.GameUtils.randomInt(0, window.BrawlerConfig.length - 1)];
        const avgLevel = Math.max(1, Math.round(
            (uiState.battle.playerTeam.reduce((sum, item) => sum + item.level, 0) / Math.max(1, uiState.battle.playerTeam.length))
        ));
        const levelOffset = window.GameUtils.randomInt(levelOffsetMin, levelOffsetMax);
        const level = Math.max(1, avgLevel + levelOffset);
        const enemyBrawler = {
            id: "enemy-" + slotIndex + "-" + Date.now(),
            type: baseConfig.type,
            level
        };
        return buildBattleFighterFromBrawler(enemyBrawler, "enemy", slotIndex);
    }

    function getTeamPowerTotal(team) {
        return team.reduce((sum, fighter) => {
            return sum + fighter.maxHp + fighter.damage * 5;
        }, 0);
    }

    function getBattleDifficultyConfig(tier) {
        if (tier === "easy") {
            return {
                tier: "easy",
                label: window.GameUtils.translate("battle.difficulty_easy"),
                color: "#5bff84",
                levelOffsetMin: -2,
                levelOffsetMax: 0,
                multiplierMin: 0.82,
                multiplierMax: 0.98
            };
        }

        if (tier === "hard") {
            return {
                tier: "hard",
                label: window.GameUtils.translate("battle.difficulty_hard"),
                color: "#ff5f6d",
                levelOffsetMin: 0,
                levelOffsetMax: 2,
                multiplierMin: 1.08,
                multiplierMax: 1.2
            };
        }

        return {
            tier: "medium",
            label: window.GameUtils.translate("battle.difficulty_medium"),
            color: "#ffd65a",
            levelOffsetMin: -1,
            levelOffsetMax: 1,
            multiplierMin: 0.95,
            multiplierMax: 1.08
        };
    }

    function pickBattleDifficultyTier() {
        const streak = uiState.battle.resultStreak;
        const roll = Math.random();

        if (streak <= -2) {
            return "easy";
        }

        if (streak === -1) {
            return roll < 0.75 ? "easy" : "medium";
        }

        if (streak >= 2) {
            if (roll < 0.45) {
                return "hard";
            }
            return roll < 0.9 ? "medium" : "easy";
        }

        if (streak === 1) {
            if (roll < 0.3) {
                return "hard";
            }
            return roll < 0.85 ? "medium" : "easy";
        }

        if (roll < 0.25) {
            return "easy";
        }

        return roll < 0.8 ? "medium" : "hard";
    }

    function createEnemyTeamForDifficulty(playerTeam, difficultyConfig) {
        const avgLevel = Math.max(1, Math.round(
            playerTeam.reduce((sum, fighter) => sum + fighter.level, 0) / Math.max(1, playerTeam.length)
        ));
        const minLevel = 1;
        const maxLevel = Math.max(1, Number(window.LevelConfig?.maxLevel) || 10);
        const attempts = 8;
        let bestTeam = null;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let attempt = 0; attempt < attempts; attempt += 1) {
            const team = [];
            for (let slotIndex = 0; slotIndex < BATTLE_TEAM_SIZE; slotIndex += 1) {
                const baseConfig = window.BrawlerConfig[window.GameUtils.randomInt(0, window.BrawlerConfig.length - 1)];
                const levelOffset = window.GameUtils.randomInt(difficultyConfig.levelOffsetMin, difficultyConfig.levelOffsetMax);
                const level = window.GameUtils.clamp(avgLevel + levelOffset, minLevel, maxLevel);
                const enemyBrawler = {
                    id: "enemy-" + slotIndex + "-" + Date.now() + "-" + attempt,
                    type: baseConfig.type,
                    level
                };
                team.push(buildBattleFighterFromBrawler(enemyBrawler, "enemy", slotIndex));
            }

            const playerPower = Math.max(1, getTeamPowerTotal(playerTeam));
            const enemyPower = Math.max(1, getTeamPowerTotal(team));
            const ratio = enemyPower / playerPower;
            const targetRatio = (difficultyConfig.multiplierMin + difficultyConfig.multiplierMax) / 2;
            const distance = Math.abs(ratio - targetRatio);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestTeam = team;
            }
        }

        return bestTeam || [];
    }

    function buildBattlePreview(playerTeam) {
        const difficultyTier = pickBattleDifficultyTier();
        const difficultyConfig = getBattleDifficultyConfig(difficultyTier);
        const enemyTeam = createEnemyTeamForDifficulty(playerTeam, difficultyConfig);
        const playerPower = Math.max(1, getTeamPowerTotal(playerTeam));
        const enemyPower = Math.max(1, getTeamPowerTotal(enemyTeam));
        const powerMultiplier = enemyPower / playerPower;
        const enemyCups = Math.max(
            0,
            Math.round((Number(window.GameState?.cups) || 0) * (0.92 + powerMultiplier * 0.12))
        );

        return {
            enemyName: getRandomEnemyNickname(),
            enemyCups,
            difficultyTier: difficultyConfig.tier,
            difficultyLabel: difficultyConfig.label,
            difficultyColor: difficultyConfig.color,
            powerMultiplier,
            playerTeam,
            enemyTeam
        };
    }

    function getRandomEnemyNickname() {
        const nicknames = [
            "ShadowFox", "TurboMax", "NinjaLeo", "LuckyStar", "FireStorm",
            "IceWolf", "DarkBlade", "PixelPro", "MisterBoom", "RedDragon",
            "GhostRider", "NeonPulse", "SkyBreaker", "ThunderKid", "AlphaZone"
        ];
        return nicknames[window.GameUtils.randomInt(0, nicknames.length - 1)];
    }

    function startBattleFromSelection() {
        const selectedIds = uiState.battle.selectedIds.slice();
        const owned = window.GameState.brawlers.slice();

        if (selectedIds.length < 2) {
            window.GameAssets.playSound("lose");
            return;
        }

        const selected = selectedIds
            .map((id) => window.Game.findBrawlerById(id))
            .filter(Boolean);
        const availableFillers = owned.filter((brawler) => !selectedIds.includes(brawler.id));

        while (selected.length < BATTLE_TEAM_SIZE && availableFillers.length > 0) {
            selected.push(availableFillers.shift());
        }

        while (selected.length < BATTLE_TEAM_SIZE && selected.length > 0) {
            selected.push(selected[selected.length - 1]);
        }

        if (selected.length < BATTLE_TEAM_SIZE) {
            window.GameAssets.playSound("lose");
            return;
        }

        const playerTeam = selected.slice(0, BATTLE_TEAM_SIZE)
            .map((brawler, index) => buildBattleFighterFromBrawler(brawler, "player", index));
        const preview = buildBattlePreview(playerTeam);
        uiState.battle.matchPreview = preview;
        uiState.battle.phase = "preview";
        window.GameAssets.playSound("button");
    }

    function getAliveBattleTeam(side) {
        const team = side === "player" ? uiState.battle.playerTeam : uiState.battle.enemyTeam;
        return team.filter((fighter) => fighter.hp > 0 && !fighter.deathStartedAt);
    }

    function refreshBattleFormation(side) {
        const teamKey = side === "player" ? "playerTeam" : "enemyTeam";
        const leftX = [200, 310, 420];
        const rightX = [1080, 970, 860];
        const team = uiState.battle[teamKey]
            .filter((fighter) => fighter.hp > 0 && !fighter.deathStartedAt)
            .slice(0, BATTLE_TEAM_SIZE);

        team.forEach((fighter, index) => {
            fighter.x = side === "player" ? leftX[index] : rightX[index];
            fighter.y = 220 + index * 160;
        });

        uiState.battle[teamKey] = team;
    }

    function addImpact(x, y, isCritical) {
        uiState.battle.impacts.push({
            x,
            y,
            startedAt: getBattleElapsedSeconds(),
            duration: isCritical ? 0.38 : 0.28,
            isCritical: Boolean(isCritical),
            explosionScale: isCritical ? 1.15 : 1
        });
        trimBattleVisuals();
    }

    function addDamageText(x, y, amount, isCritical) {
        uiState.battle.damageTexts.push({
            x,
            y,
            amount: Math.max(1, Math.round(Number(amount) || 0)),
            isCritical: Boolean(isCritical),
            startedAt: getBattleElapsedSeconds(),
            duration: isCritical ? 1.5 : 1.3
        });
        trimBattleVisuals();
    }

    function startProjectile(attacker, target, options) {
        const distance = Math.max(1, getDistance(attacker, target));
        const speed = (Number(window.BattleConfig?.bulletSpeed) || 900) * 3;
        const duration = Math.max(0.05, distance / speed);
        const opts = options || {};

        uiState.battle.projectiles.push({
            fromX: attacker.x + (opts.offsetX || 0),
            fromY: attacker.y + (opts.offsetY || 0),
            toX: target.x + (opts.targetOffsetX || 0),
            toY: target.y + (opts.targetOffsetY || 0),
            startedAt: getBattleElapsedSeconds() + (opts.delay || 0),
            duration,
            attackerSide: attacker.side,
            neonColor: opts.neonColor || (attacker.side === "player" ? "#5cf3ff" : "#ff78ae")
        });
    }

    function resolveAttack(attackerSide) {
        const attackers = getAliveBattleTeam(attackerSide);
        const defenders = getAliveBattleTeam(attackerSide === "player" ? "enemy" : "player");

        if (attackers.length === 0 || defenders.length === 0) {
            return;
        }

        const attacker = attackers[window.GameUtils.randomInt(0, attackers.length - 1)];
        const target = defenders[window.GameUtils.randomInt(0, defenders.length - 1)];
        const critUpgradeBonus = Math.max(0, window.Game.getUpgradeCurrentValue("criticalChance"));
        const playerCritCap = window.GameUtils.clamp(
            (Number(window.EconomyConfig?.criticalClickChance) || 0) + critUpgradeBonus + 0.03,
            0,
            0.95
        );
        const critChance = attackerSide === "enemy"
            ? Math.random() * playerCritCap
            : window.GameUtils.clamp(attacker.critChance + critUpgradeBonus, 0, 0.95);
        const crit = Math.random() < critChance;
        const baseDamage = attacker.damage;
        const critMultiplier = Math.max(
            1,
            Number(window.EconomyConfig?.criticalClickMultiplier) ||
            Number(window.BattleConfig?.critDamageMultiplier) ||
            5
        );
        const damage = Math.max(1, Math.round(baseDamage * (crit ? critMultiplier : 1)));

        const bulletCount = attacker.damage >= 130 ? 3 : attacker.damage >= 95 ? 2 : 1;
        const damagePerBullet = Math.max(1, Math.round(damage / bulletCount));
        const spreadOffsets = bulletCount === 3 ? [-12, 0, 12] : bulletCount === 2 ? [-8, 8] : [0];

        spreadOffsets.forEach((offset, index) => {
            startProjectile(attacker, target, {
                offsetY: offset,
                targetOffsetY: offset * 0.55,
                delay: index * 0.04
            });
        });

        attacker.recoilX = (attacker.recoilX || 0) + (attacker.side === "player" ? -14 : 14);
        target.hp = Math.max(0, target.hp - damagePerBullet * bulletCount);
        target.hitAt = getBattleElapsedSeconds();
        target.recoilX = (target.recoilX || 0) + (target.side === "player" ? -11 : 11);
        target.recoilY = (target.recoilY || 0) - (crit ? 10 : 6);
        addImpact(target.x, target.y, crit);
        addDamageText(target.x, target.y - 18, damagePerBullet * bulletCount, crit);
        if (target.hp <= 0) {
            target.deathStartedAt = getBattleElapsedSeconds();
        }
        window.GameAssets.playSound("shoot");
    }

    function updateBattleFighterPhysics(deltaSeconds) {
        ["playerTeam", "enemyTeam"].forEach((teamKey) => {
            uiState.battle[teamKey].forEach((fighter) => {
                fighter.recoilX = (fighter.recoilX || 0) * Math.max(0, 1 - deltaSeconds * 8);
                fighter.recoilY = (fighter.recoilY || 0) * Math.max(0, 1 - deltaSeconds * 8);
            });
        });
    }

    function cleanupDeadFighters() {
        const deathDuration = 0.9;
        const now = getBattleElapsedSeconds();

        ["player", "enemy"].forEach((side) => {
            const teamKey = side === "player" ? "playerTeam" : "enemyTeam";
            const before = uiState.battle[teamKey].length;
            uiState.battle[teamKey] = uiState.battle[teamKey].filter((fighter) => {
                if (!fighter.deathStartedAt) {
                    return true;
                }
                return (now - fighter.deathStartedAt) < deathDuration;
            });
            if (uiState.battle[teamKey].length !== before) {
                refreshBattleFormation(side);
            }
        });
    }

    function finishBattle(isVictory) {
        let victoryCups = Number(window.EconomyConfig.battleWinCups) || 0;
        if (isVictory) {
            if (uiState.battle.difficultyTier === "hard") {
                victoryCups = 10;
            } else if (uiState.battle.difficultyTier === "medium") {
                victoryCups = 5;
            } else if (uiState.battle.difficultyTier === "easy") {
                victoryCups = window.GameUtils.randomInt(2, 3);
            }
        }

        uiState.battle.phase = "result";
        uiState.battle.result = {
            isVictory: Boolean(isVictory),
            coins: isVictory ? Number(window.EconomyConfig.battleWinCoins) || 0 : 0,
            cups: isVictory ? victoryCups : -3
        };
        if (isVictory) {
            uiState.battle.resultStreak = uiState.battle.resultStreak >= 0 ? uiState.battle.resultStreak + 1 : 1;
        } else {
            uiState.battle.resultStreak = uiState.battle.resultStreak <= 0 ? uiState.battle.resultStreak - 1 : -1;
        }
        window.Game.applyBattleResult(
            Boolean(isVictory),
            isVictory ? { winCups: victoryCups } : null
        );
        if (isVictory) {
            const cooldownSeconds = Math.max(0, Number(window.EconomyConfig?.battleCooldownSeconds) || 30);
            uiState.battle.cooldownUntilMs = Date.now() + cooldownSeconds * 1000;
        }
        window.GameAssets.playSound(isVictory ? "win" : "lose");
    }

    function getBattleElapsedSeconds() {
        return Math.max(0, uiState.battle.elapsedMs / 1000);
    }

    function updateBattle(currentTimeSeconds, deltaSeconds) {
        uiState.battle.elapsedMs += deltaSeconds * 1000;
        updateBattleFighterPhysics(deltaSeconds);
        cleanupDeadFighters();

        if (uiState.battle.phase === "intro") {
            uiState.battle.introElapsedMs += deltaSeconds * 1000;
            if (uiState.battle.introElapsedMs >= 2100) {
                uiState.battle.phase = "fight";
                uiState.battle.lastAttackAt = currentTimeSeconds;
            }
            return;
        }

        if (uiState.battle.phase !== "fight") {
            return;
        }

        const tickMs = Number(window.BattleConfig?.attackTickMs) || 1000;
        uiState.battle.attackAccumulatorMs += deltaSeconds * 1000;

        while (uiState.battle.attackAccumulatorMs >= tickMs) {
            resolveAttack("player");
            resolveAttack("enemy");
            resolveAttack("player");
            resolveAttack("enemy");
            uiState.battle.attackAccumulatorMs -= tickMs;
        }

        const playerAlive = getAliveBattleTeam("player");
        const enemyAlive = getAliveBattleTeam("enemy");
        const maxDuration = Number(window.BattleConfig?.maxBattleDurationMs) || 90000;

        if (enemyAlive.length === 0) {
            finishBattle(true);
        } else if (playerAlive.length === 0 || uiState.battle.elapsedMs >= maxDuration) {
            finishBattle(false);
        }
    }

    function closeBattleFlow() {
        uiState.battle.phase = "idle";
        uiState.battle.selectedIds = [];
        uiState.battle.matchPreview = null;
        uiState.battle.playerTeam = [];
        uiState.battle.enemyTeam = [];
        uiState.battle.projectiles = [];
        uiState.battle.impacts = [];
        uiState.battle.damageTexts = [];
        uiState.battle.result = null;
        uiState.battle.elapsedMs = 0;
        uiState.battle.introElapsedMs = 0;
        uiState.battle.attackAccumulatorMs = 0;
        uiState.battle.cameraShake = 0;
        uiState.battle.playerName = window.GameUtils.translate("base.player");
        uiState.battle.enemyName = window.GameUtils.translate("base.player");
        uiState.battle.enemyCups = 0;
        uiState.battle.difficultyTier = "medium";
        uiState.battle.difficultyPowerMultiplier = 1;
        uiState.battle.selectScrollY = 0;
    }

    function getBattlePreviewAcceptRect() {
        return { x: 718, y: 522, width: 182, height: 56 };
    }

    function getBattlePreviewRefuseRect() {
        return { x: 382, y: 522, width: 182, height: 56 };
    }

    function acceptBattlePreview() {
        const preview = uiState.battle.matchPreview;
        if (!preview) {
            return;
        }

        uiState.battle.playerTeam = preview.playerTeam.map((fighter) => Object.assign({}, fighter));
        uiState.battle.enemyTeam = preview.enemyTeam.map((fighter) => Object.assign({}, fighter));
        uiState.battle.projectiles = [];
        uiState.battle.impacts = [];
        uiState.battle.phase = "intro";
        uiState.battle.introStartedAt = performance.now() / 1000;
        uiState.battle.introElapsedMs = 0;
        uiState.battle.lastAttackAt = 0;
        uiState.battle.attackAccumulatorMs = 0;
        uiState.battle.elapsedMs = 0;
        uiState.battle.result = null;
        uiState.battle.cameraShake = 0;
        uiState.battle.playerName = window.GameUtils.translate("base.player");
        uiState.battle.enemyName = preview.enemyName;
        uiState.battle.enemyCups = preview.enemyCups;
        uiState.battle.difficultyTier = preview.difficultyTier;
        uiState.battle.difficultyPowerMultiplier = preview.powerMultiplier;
        uiState.battle.matchPreview = null;
        uiState.battle.selectScrollY = 0;
        window.GameAssets.playSound("button");
    }

    function handleBattleClick(position) {
        if (uiState.battle.phase === "preview") {
            if (isInside(position, getBattlePreviewRefuseRect())) {
                uiState.battle.phase = "select";
                uiState.battle.matchPreview = null;
                window.GameAssets.playSound("button");
                return true;
            }

            if (isInside(position, getBattlePreviewAcceptRect())) {
                acceptBattlePreview();
                return true;
            }

            return true;
        }

        if (uiState.battle.phase === "select") {
            const viewport = getBattleSelectionViewportRect();
            const localPosition = {
                x: position.x,
                y: position.y + uiState.battle.selectScrollY
            };

            if (isInside(position, getBattleSelectCloseRect())) {
                closeBattleFlow();
                window.GameAssets.playSound("button");
                return true;
            }

            if (isInside(position, getBattlePlayRect())) {
                startBattleFromSelection();
                return true;
            }

            if (!isInside(position, viewport)) {
                return true;
            }

            const cards = getBattleSelectionCardRects();
            const sortedBrawlers = getBattleSelectionBrawlers();
            for (let index = 0; index < cards.length; index += 1) {
                if (!isInside(localPosition, cards[index])) {
                    continue;
                }

                const brawler = sortedBrawlers[index];
                if (!brawler) {
                    return true;
                }
                const selectedIndex = uiState.battle.selectedIds.indexOf(brawler.id);

                if (selectedIndex >= 0) {
                    uiState.battle.selectedIds.splice(selectedIndex, 1);
                    window.GameAssets.playSound("button");
                } else if (uiState.battle.selectedIds.length < BATTLE_TEAM_SIZE) {
                    uiState.battle.selectedIds.push(brawler.id);
                    window.GameAssets.playSound("button");
                } else {
                    window.GameAssets.playSound("lose");
                }
                return true;
            }
        }

        if (uiState.battle.phase === "result") {
            closeBattleFlow();
            window.GameSDK.showFullscreenAdv().catch(() => null);
            window.GameAssets.playSound("button");
            return true;
        }

        return true;
    }

    function createShuffledReelTypes() {
        const types = window.BrawlerConfig.map((item) => item.type);
        const reel = [];

        for (let cycle = 0; cycle < 4; cycle += 1) {
            const shuffled = types.slice();

            for (let index = shuffled.length - 1; index > 0; index -= 1) {
                const swapIndex = window.GameUtils.randomInt(0, index);
                const temp = shuffled[index];
                shuffled[index] = shuffled[swapIndex];
                shuffled[swapIndex] = temp;
            }

            reel.push(...shuffled);
        }

        return reel;
    }

    function getCenteredReelType(slotRect, offset) {
        const itemWidth = 154;
        const imageWidth = 120;
        const imageOffsetX = 36;
        const centerLineX = slotRect.x + slotRect.width / 2;
        const reelTypes = uiState.boxOpening.reelTypes;
        const baseIndex = Math.floor(offset / itemWidth);
        let selectedType = null;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let index = -4; index < 14; index += 1) {
            const reelIndex = baseIndex + index;
            const safeIndex = window.GameUtils.clamp(reelIndex, 0, Math.max(0, reelTypes.length - 1));
            const type = reelTypes[safeIndex];

            if (!type) {
                continue;
            }

            const x = slotRect.x + (index * itemWidth) - (offset % itemWidth) + imageOffsetX;
            const intersects = centerLineX >= x && centerLineX <= x + imageWidth;

            if (!intersects) {
                continue;
            }

            const imageCenter = x + imageWidth / 2;
            const distance = Math.abs(imageCenter - centerLineX);

            if (distance < bestDistance) {
                bestDistance = distance;
                selectedType = type;
            }
        }

        return selectedType;
    }

    function getSideButtons() {
        const buttons = [
            { id: "fighters", icon: "ui:fighters", title: window.GameUtils.translate("menu.fighters") },
            { id: "shop", icon: "ui:shop", title: window.GameUtils.translate("menu.shop") },
            { id: "leaderboard", icon: "ui:leaderboard", title: window.GameUtils.translate("menu.leaderboard") }
        ];

        if (window.GameState?.vipPurchased || isRealMoneyPurchasesAvailable()) {
            buttons.push({ id: "vip", icon: "ui:vip", title: window.GameUtils.translate("menu.vip") });
        }

        return buttons;
    }

    function getSideButtonRects() {
        return getSideButtons().map((button, index) => ({
            id: button.id,
            x: 30,
            y: 150 + index * 104,
            width: 138,
            height: 92
        }));
    }

    function getPanelCloseRect() {
        const body = getActivePanelBodyRect();
        const yOffset = uiState.activePanel === "vip" ? -26 : 16;
        const xOffset = uiState.activePanel === "vip" ? 27 : 0;

        return {
            x: body.x + body.width - 74 + xOffset,
            y: body.y + yOffset,
            width: 70,
            height: 58
        };
    }

    function getPanelBodyRect() {
        return {
            x: 158,
            y: 70,
            width: 964,
            height: 592
        };
    }

    function getProfilePanelBodyRect() {
        return {
            x: Math.round((window.Base.designWidth - 578) / 2),
            y: 70,
            width: 578,
            height: 592
        };
    }

    function getSettingsPanelBodyRect() {
        return {
            x: Math.round((window.Base.designWidth - 674) / 2),
            y: 70,
            width: 674,
            height: 592
        };
    }

    function getVipPanelBodyRect() {
        return {
            x: Math.round((window.Base.designWidth - 646) / 2),
            y: 130,
            width: 646,
            height: 432
        };
    }

    function getActivePanelBodyRect() {
        if (uiState.activePanel === "profile") {
            return getProfilePanelBodyRect();
        }

        if (uiState.activePanel === "settings") {
            return getSettingsPanelBodyRect();
        }

        if (uiState.activePanel === "vip") {
            return getVipPanelBodyRect();
        }

        return getPanelBodyRect();
    }

    function getFightersViewportRect() {
        return {
            x: 188,
            y: 166,
            width: 886,
            height: 468
        };
    }

    function getFightersLayout() {
        return {
            columns: 2,
            cardWidth: 416,
            cardHeight: 292,
            gap: 28,
            startX: 206,
            startY: 178
        };
    }

    function getFightersContentHeight() {
        const layout = getFightersLayout();
        const rows = Math.ceil(window.BrawlerConfig.length / layout.columns);

        return rows * layout.cardHeight + Math.max(0, rows - 1) * layout.gap;
    }

    function getMaxFightersScrollY() {
        const viewport = getFightersViewportRect();
        const layout = getFightersLayout();
        const contentBottom = layout.startY + getFightersContentHeight();
        const viewportBottom = viewport.y + viewport.height;

        return Math.max(0, contentBottom - viewportBottom + 24);
    }

    function scrollActivePanel(deltaY) {
        uiState.panel.scrollY = window.GameUtils.clamp(
            uiState.panel.scrollY + deltaY,
            0,
            getActivePanelMaxScrollY()
        );
    }

    function getShopContentViewportRect() {
        return {
            x: 188,
            y: 200,
            width: 886,
            height: 446
        };
    }

    function getActiveScrollViewportRect() {
        if (uiState.activePanel === "fighters") {
            return getFightersViewportRect();
        }

        if (uiState.activePanel === "upgrades" || uiState.activePanel === "leaderboard") {
            return getShopContentViewportRect();
        }

        return null;
    }

    function getActivePanelMaxScrollY() {
        if (uiState.activePanel === "fighters") {
            return getMaxFightersScrollY();
        }

        if (uiState.activePanel === "upgrades") {
            return getMaxUpgradesScrollY();
        }

        if (uiState.activePanel === "leaderboard") {
            return getMaxLeaderboardScrollY();
        }

        return 0;
    }

    function shouldStartPanelScroll(position) {
        if (uiState.activePanel !== "upgrades") {
            return true;
        }

        if (getShopTabRects().some((rect) => isInside(position, rect))) {
            return false;
        }

        const contentPosition = {
            x: position.x,
            y: position.y + uiState.panel.scrollY
        };

        if (uiState.panel.shopTab === "upgrades") {
            const clickedUpgradeButton = ["clickPower", "criticalChance", "passiveIncome"]
                .some((_, index) => isInside(contentPosition, getUpgradeButtonRect(index)));
            return !clickedUpgradeButton;
        }

        const clickedPackButton = getInAppsPacks()
            .some((_, index) => isInside(contentPosition, getInAppsBuyButtonRect(index)));
        return !clickedPackButton;
    }

    function handleMenuButtonClick(position) {
        const button = getSideButtonRects().find((rect) => isInside(position, rect));

        if (!button) {
            return false;
        }

        window.GameAssets.playSound("button");

        if (button.id === "fighters") {
            uiState.activePanel = "fighters";
            uiState.panel.scrollY = 0;
        } else if (button.id === "shop") {
            uiState.activePanel = "upgrades";
            uiState.panel.shopTab = "upgrades";
            uiState.panel.scrollY = 0;
        } else if (button.id === "leaderboard") {
            uiState.activePanel = "leaderboard";
            uiState.panel.scrollY = 0;
            refreshLeaderboard().catch(() => {});
        } else if (button.id === "vip") {
            uiState.activePanel = "vip";
            uiState.panel.scrollY = 0;
        }

        return true;
    }

    function handleTopBarClick(position) {
        if (isInside(position, getProfileButtonRect())) {
            uiState.activePanel = "profile";
            window.GameAssets.playSound("button");
            return true;
        }

        if (isInside(position, getSettingsButtonRect())) {
            uiState.activePanel = "settings";
            window.GameAssets.playSound("button");
            return true;
        }

        return false;
    }

    function handlePanelClick(position) {
        if (!uiState.activePanel) {
            return false;
        }

        if (isInside(position, getPanelCloseRect())) {
            uiState.activePanel = null;
            window.GameAssets.playSound("button");
            return true;
        }

        if (uiState.activePanel === "upgrades") {
            return handleUpgradePanelClick(position);
        }

        if (uiState.activePanel === "settings") {
            return handleSettingsPanelClick(position);
        }

        if (uiState.activePanel === "leaderboard") {
            return true;
        }

        if (uiState.activePanel === "vip") {
            return handleVipPanelClick(position);
        }

        return true;
    }

    function getShopTabRects() {
        return [
            { id: "upgrades", x: 214, y: 154, width: 200, height: 48 },
            { id: "inapps", x: 426, y: 154, width: 220, height: 48 }
        ];
    }

    function getUpgradeCardRect(index) {
        const viewport = getShopContentViewportRect();
        return {
            x: 214,
            y: viewport.y + 16 + index * (UPGRADE_CARD_HEIGHT + 24),
            width: 852,
            height: UPGRADE_CARD_HEIGHT
        };
    }

    function getUpgradeButtonRect(index) {
        const card = getUpgradeCardRect(index);
        return {
            x: card.x + card.width - 164,
            y: card.y + 94,
            width: 134,
            height: 42
        };
    }

    function isRealMoneyPurchasesAvailable() {
        return Boolean(window.GameSDK?.isPaymentsSupported?.());
    }

    function getInAppsPacks() {
        const config = window.InAppPurchaseConfig || {};
        const packs = Array.isArray(config.packs) ? config.packs : [];
        const defaultCurrencyLabel = config.defaultCurrencyLabel || "YAN";
        const paymentsAvailable = isRealMoneyPurchasesAvailable();

        return packs.map((pack, index) => {
            const coinAmount = Math.max(0, Math.floor(Number(pack.coinAmount) || 0));
            const priceValue = Math.max(0, Math.floor(Number(pack.priceValue) || 0));
            const productId = String(pack.productId || pack.id || ("pack_" + index)).trim();
            const purchaseType = pack.purchaseType === "rewarded" ? "rewarded" : "purchase";

            if (purchaseType === "purchase" && !paymentsAvailable) {
                return null;
            }

            const entry = {
                id: pack.id || "pack_" + index,
                productId,
                purchaseType,
                coinAmount,
                priceValue,
                currencyLabel: pack.currencyLabel || defaultCurrencyLabel
            };

            if (purchaseType === "purchase" && productId) {
                const catalog = window.GameSDK?.getIapCatalogProduct?.(productId);
                if (catalog) {
                    entry.catalogPrice = catalog.price || "";
                    entry.priceCurrencyCode = catalog.priceCurrencyCode || "";
                    entry.catalogDescription = String(catalog.description || "").trim();
                    const fromCatalog = Math.floor(Number(catalog.priceValue));
                    if (Number.isFinite(fromCatalog) && fromCatalog > 0) {
                        entry.priceValue = fromCatalog;
                    }
                }
            }

            return entry;
        }).filter((pack) => pack && pack.coinAmount > 0);
    }

    function getInAppsCardRect(index) {
        const viewport = getShopContentViewportRect();
        return {
            x: 214,
            y: viewport.y + 16 + index * 112,
            width: 852,
            height: 94
        };
    }

    function getInAppsBuyButtonRect(index) {
        const card = getInAppsCardRect(index);
        const pack = getInAppsPacks()[index];
        const isRewarded = pack?.purchaseType === "rewarded";
        const buttonWidth = isRewarded ? 154 : 134;
        return {
            x: card.x + card.width - 30 - buttonWidth,
            y: card.y + 26,
            width: buttonWidth,
            height: 42
        };
    }

    function getVipBuyButtonRect() {
        const body = getVipPanelBodyRect();
        const iconBlockWidth = 250;
        const textBlockX = body.x + iconBlockWidth + 26;
        const textBlockWidth = body.width - iconBlockWidth - 58;
        return { x: textBlockX, y: body.y + 332, width: textBlockWidth, height: 52 };
    }

    function getSettingsSliderRect(index) {
        return {
            x: 380,
            y: 252 + index * 130,
            width: 540,
            height: 16
        };
    }

    function getReduceAnimationsToggleRect() {
        return {
            x: 380,
            y: 512,
            width: 540,
            height: 52
        };
    }

    function getUpgradeContentHeight() {
        const upgradeCount = 3;
        return upgradeCount * UPGRADE_CARD_HEIGHT + Math.max(0, upgradeCount - 1) * 24 + 32;
    }

    function getInAppsContentHeight() {
        const count = getInAppsPacks().length;
        return count * 112 + 32;
    }

    function getMaxUpgradesScrollY() {
        const viewport = getShopContentViewportRect();
        const contentHeight = uiState.panel.shopTab === "upgrades"
            ? getUpgradeContentHeight()
            : getInAppsContentHeight();
        return Math.max(0, contentHeight - viewport.height);
    }

    function getLeaderboardCardRect(index) {
        const viewport = getShopContentViewportRect();
        return {
            x: 214,
            y: viewport.y + 16 + index * 90,
            width: 852,
            height: 72
        };
    }

    function getLeaderboardContentHeight() {
        const count = getLeaderboardEntries().length;
        return count * 90 + 32;
    }

    function getMaxLeaderboardScrollY() {
        const viewport = getShopContentViewportRect();
        return Math.max(0, getLeaderboardContentHeight() - viewport.height);
    }

    function getLeaderboardEntries() {
        if (Array.isArray(uiState.leaderboard.entries) && uiState.leaderboard.entries.length > 0) {
            return uiState.leaderboard.entries;
        }

        const playerCups = Number(window.GameState.cups) || 0;
        const me = {
            rank: 1,
            name: "You",
            accountName: "Player Account",
            cups: playerCups
        };

        return [
            { rank: 2, name: "MemeKing", accountName: "mk_783", cups: playerCups + 210 },
            { rank: 3, name: "TurboDoge", accountName: "doge_x", cups: playerCups + 160 },
            { rank: 4, name: "SkibiHero", accountName: "skibihero", cups: playerCups + 95 },
            me,
            { rank: 5, name: "NoobCrusher", accountName: "crusher_09", cups: Math.max(0, playerCups - 40) },
            { rank: 6, name: "CoolMerge", accountName: "coolmerge", cups: Math.max(0, playerCups - 75) },
            { rank: 7, name: "ProMeme", accountName: "pro_meme", cups: Math.max(0, playerCups - 120) }
        ].sort((a, b) => b.cups - a.cups).map((entry, index) => Object.assign({}, entry, { rank: index + 1 }));
    }

    async function refreshLeaderboard() {
        if (uiState.leaderboard.isLoading) {
            return;
        }

        uiState.leaderboard.isLoading = true;
        try {
            const response = await window.GameSDK.getLeaderboardEntries({
                quantityTop: 10,
                includeUser: true,
                quantityAround: 3
            });
            const entries = Array.isArray(response?.entries) ? response.entries : [];

            uiState.leaderboard.entries = entries.map((entry, index) => {
                const player = entry?.player || {};
                const publicName = player.publicName || window.GameUtils.translate("leaderboard.hidden_player");
                return {
                    rank: Number(entry?.rank) || index + 1,
                    name: publicName,
                    accountName: "",
                    cups: Number(entry?.score) || 0
                };
            });
            uiState.leaderboard.requestedAt = performance.now();
        } catch (error) {
            uiState.leaderboard.entries = [];
        } finally {
            uiState.leaderboard.isLoading = false;
        }
    }

    function startVolumeSliderInteraction(position) {
        if (uiState.activePanel !== "settings") {
            return false;
        }

        const sliderDefs = [
            { key: "musicVolume", rect: getSettingsSliderRect(0) },
            { key: "soundVolume", rect: getSettingsSliderRect(1) }
        ];

        const activeSlider = sliderDefs.find((slider) => {
            const hitRect = {
                x: slider.rect.x - 24,
                y: slider.rect.y - 24,
                width: slider.rect.width + 48,
                height: slider.rect.height + 48
            };
            return isInside(position, hitRect);
        });

        if (!activeSlider) {
            return false;
        }

        uiState.panel.volumeSliderKey = activeSlider.key;
        updateVolumeSlider(activeSlider.key, position.x);
        return true;
    }

    function updateVolumeSlider(settingKey, pointerX) {
        const sliderIndex = settingKey === "musicVolume" ? 0 : 1;
        const sliderRect = getSettingsSliderRect(sliderIndex);
        const ratio = window.GameUtils.clamp((pointerX - sliderRect.x) / sliderRect.width, 0, 1);
        const roundedRatio = Math.round(ratio * 100) / 100;

        window.Game.setSettingValue(settingKey, roundedRatio);
        window.GameAssets.refreshAudioSettings();
        playSliderTickSound();
    }

    function playSliderTickSound() {
        const now = performance.now();

        if (now - uiState.panel.lastSliderSoundAt < 90) {
            return;
        }

        uiState.panel.lastSliderSoundAt = now;
        window.GameAssets.playSound("button");
    }

    function handleUpgradePanelClick(position) {
        const tab = getShopTabRects().find((tabRect) => isInside(position, tabRect));
        const contentPosition = {
            x: position.x,
            y: position.y + uiState.panel.scrollY
        };

        if (tab) {
            uiState.panel.shopTab = tab.id;
            uiState.panel.scrollY = 0;
            window.GameAssets.playSound("button");
            return true;
        }

        if (uiState.panel.shopTab !== "upgrades") {
            const packs = getInAppsPacks();

            for (let index = 0; index < packs.length; index += 1) {
                if (!isInside(contentPosition, getInAppsBuyButtonRect(index))) {
                    continue;
                }

                requestShopPack(packs[index]);
                return true;
            }

            return true;
        }

        const upgradeKeys = ["clickPower", "criticalChance", "passiveIncome"];

        for (let index = 0; index < upgradeKeys.length; index += 1) {
            const buttonRect = getUpgradeButtonRect(index);

            if (!isInside(contentPosition, buttonRect)) {
                continue;
            }

            const result = window.Game.buyUpgrade(upgradeKeys[index]);
            window.GameAssets.playSound(result ? "button" : "lose");
            return true;
        }

        return true;
    }

    function requestShopPack(pack) {
        if (!pack || uiState.panel.inAppsPurchasePendingId) {
            return;
        }

        const productId = pack.productId || pack.id || "rewarded_pack";
        uiState.panel.inAppsPurchasePendingId = productId;

        if (pack.purchaseType === "rewarded") {
            window.GameSDK.showRewardedVideo()
                .then((result) => {
                    if (!result?.rewarded) {
                        window.GameAssets.playSound("lose");
                        return;
                    }

                    window.Game.grantCoinPack(pack.coinAmount);
                    window.GameAssets.playSound("button");
                })
                .catch(() => {
                    window.GameAssets.playSound("lose");
                })
                .finally(() => {
                    uiState.panel.inAppsPurchasePendingId = null;
                });
            return;
        }

        window.GameSDK.purchaseProduct(productId, "shop_inapp")
            .then((result) => {
                if (!result?.success) {
                    window.GameAssets.playSound("lose");
                    return;
                }

                const granted = window.Game.grantCoinPackByProductId(productId);
                if (granted) {
                    window.GameSDK.consumePurchase(productId).catch(() => {});
                    window.GameAssets.playSound("button");
                } else {
                    window.GameAssets.playSound("lose");
                }
            })
            .catch(() => {
                window.GameAssets.playSound("lose");
            })
            .finally(() => {
                uiState.panel.inAppsPurchasePendingId = null;
            });
    }

    function handleVipPanelClick(position) {
        if (!isInside(position, getVipBuyButtonRect())) {
            return true;
        }

        const packs = Array.isArray(window.InAppPurchaseConfig?.packs) ? window.InAppPurchaseConfig.packs : [];
        const vipPack = packs.find((pack) => pack.grantVip);
        const productId = vipPack?.productId || vipPack?.id || "vip_forever";
        const isPurchaseVip = vipPack?.purchaseType === "purchase";

        if (isPurchaseVip && !isRealMoneyPurchasesAvailable()) {
            window.GameAssets.playSound("lose");
            return true;
        }

        if (!vipPack || !isPurchaseVip) {
            const result = window.Game.buyVip();
            window.GameAssets.playSound(result?.success ? "button" : "lose");
            return true;
        }

        window.GameSDK.purchaseProduct(productId, "vip_panel")
            .then((result) => {
                if (!result?.success) {
                    window.GameAssets.playSound("lose");
                    return;
                }

                const granted = window.Game.grantVipByProductId(productId);
                if (granted) {
                    window.GameSDK.consumePurchase(productId).catch(() => {});
                    window.GameAssets.playSound("button");
                } else {
                    window.GameAssets.playSound("lose");
                }
            })
            .catch(() => {
                window.GameAssets.playSound("lose");
            });

        return true;
    }

    function handleSettingsPanelClick(position) {
        if (startVolumeSliderInteraction(position)) {
            return true;
        }

        if (isInside(position, getReduceAnimationsToggleRect())) {
            window.Game.setSettingValue("reduceAnimations", !window.GameState.settings.reduceAnimations);
            window.GameAssets.playSound("button");
            resize();
            return true;
        }

        return true;
    }

    function render(time, deltaSeconds) {
        if (!uiState.context) {
            return;
        }

        updateDynamicQuality(deltaSeconds);

        if (uiState.battle.phase === "fight" || uiState.battle.phase === "intro") {
            updateBattle(time, deltaSeconds);
        } else {
            window.Game.tick(deltaSeconds);
        }

        const ctx = uiState.context;
        const dpr = uiState.renderDpr || window.devicePixelRatio || 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, uiState.cssWidth, uiState.cssHeight);
        ctx.fillStyle = "#101525";
        ctx.fillRect(0, 0, uiState.cssWidth, uiState.cssHeight);

        ctx.save();
        ctx.translate(uiState.offsetX, uiState.offsetY);
        ctx.scale(uiState.scale, uiState.scale);
        if (uiState.battle.phase === "fight" || uiState.battle.phase === "intro" || uiState.battle.phase === "result") {
            drawBattleScene(ctx, time);
        } else {
            drawMainMenu(ctx, time);
        }
        if (uiState.battle.phase === "select" || uiState.battle.phase === "preview") {
            drawBattleSelectionPanel(ctx);
        }
        if (uiState.battle.phase === "preview") {
            drawBattlePreviewOverlay(ctx);
        }
        ctx.restore();
    }

    function drawMainMenu(ctx, time) {
        drawBackground(ctx, time);
        drawTopBar(ctx);
        drawCenterField(ctx);
        drawBrawlers(ctx, time);
        drawMergeEffects(ctx, time);
        drawSideButtons(ctx);
        drawBottomBar(ctx);
        drawClickEffects(ctx, time);
        drawCoinFlyEffects(ctx, time);
        drawActivePanel(ctx);
        drawBoxOpeningOverlay(ctx, time);
    }

    function drawBackground(ctx, time) {
        const gradient = ctx.createLinearGradient(0, 0, window.Base.designWidth, window.Base.designHeight);
        gradient.addColorStop(0, "#2437a8");
        gradient.addColorStop(0.45, "#8f39d8");
        gradient.addColorStop(1, "#101525");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:background", 0, 0, window.Base.designWidth, window.Base.designHeight, "", "rgba(255, 255, 255, 0.04)");
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        if (!isReduceAnimations()) {
            drawFloatingBubbles(ctx, time);
        }
    }

    function drawFloatingBubbles(ctx, time) {
        const bubbleLimit = getPerformanceLimits().bubbleCountMenu;

        ctx.save();
        for (let index = 0; index < bubbleLimit; index += 1) {
            const baseX = (index * 83) % (window.Base.designWidth + 120) - 60;
            const baseY = (index * 137) % (window.Base.designHeight + 120) - 60;
            const waveX = Math.sin(time * (0.7 + index * 0.024) + index) * 28;
            const driftY = ((time * (20 + (index % 5) * 2) + index * 47) % (window.Base.designHeight + 160)) - 80;
            const x = baseX + waveX;
            const y = (baseY + driftY) % (window.Base.designHeight + 120) - 40;
            const pulse = 1 + Math.sin(time * (1.8 + index * 0.04) + index * 0.7) * 0.18;
            const radius = (9 + (index % 5) * 7) * pulse;

            ctx.globalAlpha = 0.08 + (index % 4) * 0.035;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawPanel(ctx, x, y, width, height, color) {
        ctx.save();
        ctx.fillStyle = color || "rgba(12, 18, 38, 0.84)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 8;
        ctx.beginPath();
        roundRectPath(ctx, x, y, width, height, Math.min(24, height / 3));
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();
    }

    function roundRectPath(ctx, x, y, width, height, radius) {
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, radius);
            return;
        }

        const safeRadius = Math.min(radius, width / 2, height / 2);
        ctx.moveTo(x + safeRadius, y);
        ctx.lineTo(x + width - safeRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
        ctx.lineTo(x + width, y + height - safeRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
        ctx.lineTo(x + safeRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
        ctx.lineTo(x, y + safeRadius);
        ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    }

    function drawText(ctx, text, x, y, size, align) {
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = align || "center";
        ctx.textBaseline = "middle";
        ctx.font = "800 " + size + "px Arial";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    function getButtonScale(rect) {
        if (isReduceAnimations()) {
            return 1;
        }

        if (uiState.boxOpening.active) {
            return 1;
        }

        if (uiState.pointer.isDown && isInside(uiState.pointer, rect)) {
            return 0.95;
        }

        if (isInside(uiState.pointer, rect)) {
            return 1.08;
        }

        return 1;
    }

    function drawInteractivePanel(ctx, rect, color, hoverColor) {
        const scale = getButtonScale(rect);
        const drawColor = scale > 1 ? (hoverColor || color) : color;

        if (Math.abs(scale - 1) < 0.001) {
            drawPanel(ctx, rect.x, rect.y, rect.width, rect.height, drawColor);
            return;
        }

        ctx.save();
        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        ctx.scale(scale, scale);
        drawPanel(ctx, -rect.width / 2, -rect.height / 2, rect.width, rect.height, drawColor);
        ctx.restore();
    }

    function drawCurrency(ctx, x, y, width, iconKey, value, label) {
        drawPanel(ctx, x, y, width, 58, "rgba(7, 12, 28, 0.82)");
        window.GameAssets.drawImageOrPlaceholder(ctx, iconKey, x + 12, y + 7, 44, 44, label, "#ffbd2f");
        drawText(ctx, window.GameUtils.formatNumber(value), x + 70, y + 30, 24, "left");
    }

    function getCoinCounterTarget() {
        return {
            x: 952,
            y: 66
        };
    }

    function getProfileButtonRect() {
        return { x: 26, y: 22, width: 142, height: 104 };
    }

    function getSettingsButtonRect() {
        return { x: 1154, y: 26, width: 88, height: 76 };
    }

    function drawTopBar(ctx) {
        drawButton(ctx, 26, 22, 142, 104, "ui:profile", window.GameUtils.translate("menu.profile"), {
            iconSize: 58,
            iconOffsetY: 10,
            textSize: 22,
            textBottom: 14
        });
        drawCurrency(ctx, 186, 36, 190, "ui:cup", window.GameState.cups, window.GameUtils.translate("base.cups"));
        drawCurrency(ctx, 930, 36, 210, "ui:coin", window.GameState.coins, window.GameUtils.translate("base.coins"));
        drawIconButton(ctx, 1154, 26, 88, 76, "ui:settings", "");
        drawText(ctx, window.GameUtils.translate("base.game_title"), 640, 65, 28, "center");
    }

    function getCenterFieldRect() {
        return {
            x: 250,
            y: 130,
            width: 780,
            height: 400
        };
    }

    function drawCenterField(ctx) {
        const field = getCenterFieldRect();
        drawPanel(ctx, field.x, field.y, field.width, field.height, "rgba(15, 24, 50, 0.58)");
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 2;
        for (let index = 0; index < 5; index += 1) {
            const y = field.y + 70 + index * 62;
            ctx.beginPath();
            ctx.moveTo(field.x + 28, y);
            ctx.lineTo(field.x + field.width - 28, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawBrawlers(ctx, time) {
        let draggedBrawler = null;

        window.GameState.brawlers.forEach((brawler, index) => {
            if (brawler.id === uiState.drag.brawlerId) {
                draggedBrawler = brawler;
                return;
            }

            drawBrawler(ctx, brawler, index, time, false);
        });

        if (draggedBrawler) {
            drawBrawler(ctx, draggedBrawler, window.GameState.brawlers.length, time, true);
        }
    }

    function drawBrawler(ctx, brawler, index, time, isDragged) {
        const config = window.Game.getBrawlerConfig(brawler.type);
        const stats = window.Game.getBrawlerStats(brawler.type, brawler.level);
        const idleOff = isReduceAnimations();
        const pulse = isDragged ? 1.08 : (idleOff ? 1 : Math.sin(time * 4 + index) * 0.035 + 1);
        const sway = isDragged || idleOff ? 0 : Math.sin(time * 2 + index * 1.7) * 7;
        const size = 168 * pulse;
        const x = brawler.x + sway - size / 2;
        const y = brawler.y - size / 2;

        if (isDragged) {
            drawMergeHint(ctx, brawler);
        }

        drawPanel(ctx, x + 12, y + size - 18, size - 24, 42, "rgba(0, 0, 0, 0.42)");
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "brawler:" + brawler.type,
            x,
            y,
            size,
            size,
            window.GameUtils.translate("brawlers." + config.nameKey),
            "#4c9dff"
        );
        drawText(ctx, "Lv." + brawler.level, brawler.x + sway, y + size + 2, 20, "center");
        ctx.fillStyle = "#75ff8f";
        ctx.font = "700 15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(stats.hp + " HP / " + stats.damage + " DMG", brawler.x + sway, y + size + 28);
    }

    function drawMergeHint(ctx, draggedBrawler) {
        const mergeTarget = findMergeTarget(draggedBrawler);

        if (!mergeTarget) {
            return;
        }

        ctx.save();
        ctx.strokeStyle = "#fff176";
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(mergeTarget.x, mergeTarget.y, BRAWLER_RADIUS + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawMergeEffects(ctx, time) {
        if ((getPerformanceLimits().maxMergeEffects || 0) <= 0) {
            uiState.mergeEffects.length = 0;
            return;
        }

        uiState.mergeEffects = uiState.mergeEffects.filter((effect) => {
            const progress = (time - effect.startedAt) / MERGE_EFFECT_DURATION;

            if (progress >= 1) {
                return false;
            }

            drawMergeEffect(ctx, effect, progress);
            return true;
        });
    }

    function drawMergeEffect(ctx, effect, progress) {
        const radius = 35 + progress * 115;
        const alpha = 1 - progress;
        const sparkCount = Math.max(0, getPerformanceLimits().mergeSparkCount || 0);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#fff176";
        ctx.lineWidth = 8 * alpha;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let index = 0; index < sparkCount; index += 1) {
            const angle = index / Math.max(1, sparkCount) * Math.PI * 2;
            const distance = 34 + progress * 150;
            const x = effect.x + Math.cos(angle) * distance;
            const y = effect.y + Math.sin(angle) * distance;
            const starRadius = 8 + (index % 3) * 3;

            ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#63f7ff";
            drawSparkStar(ctx, x, y, starRadius, starRadius * 0.45, 5);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawClickEffects(ctx, time) {
        if ((getPerformanceLimits().maxClickEffects || 0) <= 0) {
            uiState.clickEffects.length = 0;
            return;
        }

        const duration = 0.85;

        uiState.clickEffects = uiState.clickEffects.filter((effect) => {
            const progress = (time - effect.startedAt) / duration;

            if (progress >= 1) {
                return false;
            }

            const y = effect.y - progress * 52;
            const scale = 1 + Math.sin(progress * Math.PI) * 0.25;
            const alpha = 1 - progress;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(effect.x, y);
            ctx.scale(scale, scale);
            window.GameAssets.drawImageOrPlaceholder(ctx, "ui:coin", -44, -18, 34, 34, window.GameUtils.translate("base.coins"), "#ffbd2f");
            drawText(ctx, "+" + effect.amount, 10, 0, 28, "left");
            ctx.restore();

            return true;
        });
    }

    function drawCoinFlyEffects(ctx, time) {
        if ((getPerformanceLimits().maxCoinFly || 0) <= 0) {
            uiState.coinFlyEffects.length = 0;
            return;
        }

        const target = getCoinCounterTarget();

        uiState.coinFlyEffects = uiState.coinFlyEffects.filter((effect) => {
            const elapsed = Math.max(0, time - effect.startedAt);
            const orbitDuration = Math.max(0.01, Number(effect.orbitDuration) || 2.4);
            const flyDuration = Math.max(0.01, Number(effect.flyDuration) || 0.72);
            const totalDuration = orbitDuration + flyDuration;
            const progress = elapsed / totalDuration;

            if (progress >= 1) {
                return false;
            }

            const size = Math.max(29, (Number(effect.size) || 44) - progress * 8);
            let x = effect.x;
            let y = effect.y;
            let alpha = 1;
            const angle = (Number(effect.spinAngle) || 0) + elapsed * (Number(effect.spinSpeed) || 0);

            if (elapsed < orbitDuration) {
                const hoverProgress = elapsed / orbitDuration;
                const settle = 1 - Math.pow(1 - hoverProgress, 2);
                const wobble = Math.sin(elapsed * (effect.wobbleSpeed || 2.2) * Math.PI * 2);
                x = effect.x + (effect.driftX || 0) * settle + wobble * (effect.wobbleAmplitude || 6);
                y = effect.y + (effect.driftY || 0) * settle + Math.cos(elapsed * ((effect.wobbleSpeed || 2.2) * 1.2)) * (effect.wobbleAmplitude || 6) * 0.7;
                alpha = 0.92;
            } else {
                const flyProgress = (elapsed - orbitDuration) / flyDuration;
                const eased = 1 - Math.pow(1 - flyProgress, 3);
                const startX = effect.x + (effect.driftX || 0);
                const startY = effect.y + (effect.driftY || 0);
                const arc = Math.sin(flyProgress * Math.PI) * 70;
                x = startX + (target.x - startX) * eased;
                y = startY + (target.y - startY) * eased - arc;
                alpha = 1 - flyProgress * 0.2;
            }

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            ctx.rotate(angle);

            if (getPerformanceLimits().coinGlow) {
                const glowRadius = size * 0.85;
                const glowGradient = ctx.createRadialGradient(0, 0, glowRadius * 0.15, 0, 0, glowRadius);
                glowGradient.addColorStop(0, "rgba(255, 230, 120, 0.45)");
                glowGradient.addColorStop(1, "rgba(255, 180, 40, 0)");
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowColor = "rgba(255, 205, 80, 0.55)";
                ctx.shadowBlur = 12;
            }

            window.GameAssets.drawImageOrPlaceholder(ctx, "ui:coin", -size / 2, -size / 2, size, size, window.GameUtils.translate("base.coins"), "#ffbd2f");
            ctx.restore();

            return true;
        });
    }

    function drawSparkStar(ctx, centerX, centerY, outerRadius, innerRadius, points) {
        ctx.beginPath();

        for (let index = 0; index < points * 2; index += 1) {
            const radius = index % 2 === 0 ? outerRadius : innerRadius;
            const angle = -Math.PI / 2 + index * Math.PI / points;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
    }

    function drawButton(ctx, x, y, width, height, iconKey, label, options) {
        const settings = Object.assign({
            color: "rgba(30, 53, 120, 0.86)",
            iconSize: Math.min(62, width - 28),
            iconOffsetY: 10,
            textSize: 18,
            textBottom: 12
        }, options || {});
        const rect = { x, y, width, height };
        const scale = getButtonScale(rect);
        const drawColor = scale > 1 ? "rgba(56, 88, 178, 0.95)" : settings.color;

        ctx.save();
        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        ctx.scale(scale, scale);
        drawPanel(ctx, -rect.width / 2, -rect.height / 2, rect.width, rect.height, drawColor);
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            iconKey,
            -rect.width / 2 + rect.width / 2 - settings.iconSize / 2,
            -rect.height / 2 + settings.iconOffsetY,
            settings.iconSize,
            settings.iconSize,
            label,
            "#4964ff"
        );
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = "900 " + settings.textSize + "px Arial";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
        ctx.strokeText(label, 0, rect.height / 2 - settings.textBottom, rect.width - 10);
        ctx.fillText(label, 0, rect.height / 2 - settings.textBottom, rect.width - 10);
        ctx.restore();
    }

    function drawIconButton(ctx, x, y, width, height, iconKey, label) {
        const rect = { x, y, width, height };
        const scale = getButtonScale(rect);
        const drawColor = scale > 1 ? "rgba(56, 88, 178, 0.95)" : "rgba(30, 53, 120, 0.86)";
        const iconSize = Math.min(width, height) - 22;

        ctx.save();
        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        ctx.scale(scale, scale);
        drawPanel(ctx, -rect.width / 2, -rect.height / 2, rect.width, rect.height, drawColor);
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            iconKey,
            -iconSize / 2,
            -iconSize / 2,
            iconSize,
            iconSize,
            label,
            "#4964ff"
        );
        ctx.restore();
    }

    function drawSideButtons(ctx) {
        const buttons = getSideButtons();
        const rects = getSideButtonRects();

        buttons.forEach((button, index) => {
            const rect = rects[index];

            drawButton(ctx, rect.x, rect.y, rect.width, rect.height, button.icon, button.title, {
                iconSize: 66,
                iconOffsetY: -12,
                textSize: 21,
                textBottom: 12
            });
        });
    }

    function drawBottomBar(ctx) {
        const offerRect = getCharacterOfferRect();
        const progressRect = getProgressBoxRect();
        const adRect = getAdBoxRect();
        const battleRect = getBattleButtonRect();

        drawProgressBox(ctx, progressRect.x, progressRect.y, progressRect.width, progressRect.height);
        drawRewardBox(ctx, adRect.x, adRect.y, adRect.width, adRect.height);

        drawCharacterOffer(ctx, offerRect.x, offerRect.y, offerRect.width, offerRect.height);

        const cooldownMs = getBattleCooldownRemainingMs();
        const battleLocked = cooldownMs > 0;
        drawInteractivePanel(ctx, battleRect, battleLocked ? "#5f6a89" : "#ffb000", battleLocked ? "#5f6a89" : "#ffcb3f");

        if (!battleLocked) {
            drawText(ctx, window.GameUtils.translate("menu.battle"), battleRect.x + battleRect.width / 2, battleRect.y + 56, 38, "center");
            return;
        }

        const timerText = window.GameUtils.translate("menu.battle_locked", { time: formatCooldownTime(cooldownMs) });
        drawText(ctx, timerText, battleRect.x + battleRect.width / 2, battleRect.y + 34, 18, "center");

        const skipRect = getBattleSkipRect();
        drawInteractivePanel(ctx, skipRect, uiState.battle.skipCooldownPending ? "#5f6a89" : "#23c26b", uiState.battle.skipCooldownPending ? "#5f6a89" : "#31d77d");
        drawVideoBadge(ctx, skipRect.x + 6, skipRect.y + 4, 24);
        drawText(
            ctx,
            uiState.battle.skipCooldownPending ? "..." : window.GameUtils.translate("base.skip"),
            skipRect.x + skipRect.width / 2 + 10,
            skipRect.y + skipRect.height / 2 + 1,
            17,
            "center"
        );
    }

    function drawCharacterOffer(ctx, x, y, width, height) {
        const firstBrawler = window.BrawlerConfig[0];
        const iconSize = 90;
        const pricePanelX = x + 22;
        const pricePanelY = y + height - 58;
        const pricePanelWidth = width - 44;
        const pricePanelHeight = 44;
        const priceCenterY = pricePanelY + pricePanelHeight / 2;

        drawInteractivePanel(ctx, { x, y, width, height }, "rgba(26, 17, 42, 0.86)", "rgba(44, 26, 72, 0.95)");
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "brawler:" + firstBrawler.type,
            x + width / 2 - iconSize / 2,
            y - 52,
            iconSize,
            iconSize,
            window.GameUtils.translate("brawlers." + firstBrawler.nameKey),
            "#4c9dff"
        );
        drawPanel(ctx, pricePanelX, pricePanelY, pricePanelWidth, pricePanelHeight, "rgba(0, 0, 0, 0.42)");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:coin", pricePanelX + 22, priceCenterY - 15, 30, 30, window.GameUtils.translate("base.coins"), "#ffbd2f");
        drawText(ctx, String(window.Game.getCharacterOfferPrice()), pricePanelX + pricePanelWidth / 2 + 18, priceCenterY, 25, "center");
    }

    function drawProgressBox(ctx, x, y, width, height) {
        const current = window.GameState.progressCubes;
        const required = window.EconomyConfig.progressionBoxRequiredCubes;
        const progress = window.GameUtils.clamp(current / required, 0, 1);
        const iconSize = 134;
        const barX = x + 39;
        const barY = y + height - 26;
        const barWidth = width - 63;
        const barHeight = 12;

        drawInteractivePanel(ctx, { x, y, width, height }, "rgba(30, 53, 120, 0.86)", "rgba(56, 88, 178, 0.95)");
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "ui:box",
            x + width / 2 - iconSize / 2,
            y - 36,
            iconSize,
            iconSize,
            window.GameUtils.translate("menu.box_progress"),
            "#7a5cff"
        );

        drawPanel(ctx, barX, barY, barWidth, barHeight, "rgba(0, 0, 0, 0.42)");
        ctx.save();
        ctx.fillStyle = "#48e6ff";
        ctx.beginPath();
        roundRectPath(ctx, barX + 2, barY + 2, Math.max(8, (barWidth - 4) * progress), barHeight - 4, 7);
        ctx.fill();
        ctx.restore();

        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "ui:cup",
            barX - 18,
            barY - 10,
            28,
            28,
            "",
            "#ffbd2f"
        );
        drawText(ctx, current + "/" + required, x + width / 2 + 16, barY + barHeight / 2, 20, "center");
        drawText(ctx, window.GameUtils.translate("menu.box_progress"), x + width / 2, y + height - 54, 20, "center");
    }

    function drawRewardBox(ctx, x, y, width, height) {
        const iconSize = 122;
        const label = window.GameUtils.translate("menu.box_progress");
        const labelY = y + height - 24;

        drawInteractivePanel(ctx, { x, y, width, height }, "rgba(30, 53, 120, 0.86)", "rgba(56, 88, 178, 0.95)");
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "ui:box",
            x + width / 2 - iconSize / 2,
            y - 32,
            iconSize,
            iconSize,
            label,
            "#4964ff"
        );
        drawVideoBadge(ctx, x + 30, labelY - 16, 30);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 19px Arial";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
        ctx.strokeText(label, x + width / 2 + 14, labelY, width - 58);
        ctx.fillText(label, x + width / 2 + 14, labelY, width - 58);
    }

    function drawVideoBadge(ctx, x, y, size) {
        ctx.save();
        ctx.fillStyle = "#ff3f70";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        roundRectPath(ctx, x, y, size, size, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(x + size * 0.4, y + size * 0.28);
        ctx.lineTo(x + size * 0.4, y + size * 0.72);
        ctx.lineTo(x + size * 0.75, y + size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawBattleSelectionPanel(ctx) {
        const cards = getBattleSelectionCardRects();
        const sortedBrawlers = getBattleSelectionBrawlers();
        const viewport = getBattleSelectionViewportRect();
        const closeRect = getBattleSelectCloseRect();
        const playRect = getBattlePlayRect();
        const selectedCount = uiState.battle.selectedIds.length;
        const canPlay = selectedCount >= 2 && selectedCount <= BATTLE_TEAM_SIZE;

        ctx.save();
        ctx.fillStyle = "rgba(6, 8, 20, 0.82)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        drawPanel(ctx, 74, 72, 1132, 622, "rgba(16, 26, 68, 0.96)");
        drawText(ctx, window.GameUtils.translate("battle.team_selection_title"), 640, 103, 36, "center");
        drawText(ctx, window.GameUtils.translate("battle.team_selection_subtitle"), 640, 137, 22, "center");

        ctx.save();
        ctx.beginPath();
        ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
        ctx.clip();
        ctx.translate(0, -uiState.battle.selectScrollY);
        const pointerForCards = {
            x: uiState.pointer.x,
            y: uiState.pointer.y + uiState.battle.selectScrollY
        };
        const pointerInsideViewport = isInside(uiState.pointer, viewport);
        cards.forEach((card, index) => {
            const brawler = sortedBrawlers[index];
            if (!brawler) {
                return;
            }
            const selected = uiState.battle.selectedIds.includes(brawler.id);
            const config = window.Game.getBrawlerConfig(brawler.type);
            const stats = window.Game.getBrawlerStats(brawler.type, brawler.level);
            const hovered = pointerInsideViewport && isInside(pointerForCards, card);
            const baseColor = selected ? "#2e9e5e" : "rgba(30, 53, 120, 0.88)";
            const hoverColor = selected ? "#3cbc72" : "#4f73d2";
            drawPanel(ctx, card.x, card.y, card.width, card.height, hovered ? hoverColor : baseColor);
            window.GameAssets.drawImageOrPlaceholder(
                ctx,
                "brawler:" + brawler.type,
                card.x + 30,
                card.y + 16,
                124,
                124,
                window.GameUtils.translate("brawlers." + config.nameKey),
                "#4c9dff"
            );
            drawText(ctx, window.GameUtils.translate("brawlers." + config.nameKey), card.x + card.width / 2, card.y + 158, 20, "center");
            drawText(ctx, "Lv." + brawler.level, card.x + card.width / 2, card.y + 184, 18, "center");
            drawText(ctx, stats.hp + " HP / " + stats.damage, card.x + card.width / 2, card.y + 206, 16, "center");
        });
        ctx.restore();

        const maxScroll = getBattleSelectionMaxScrollY();
        if (maxScroll > 0) {
            const trackX = viewport.x + viewport.width + 10;
            const trackY = viewport.y;
            const trackHeight = viewport.height;
            const thumbHeight = Math.max(64, trackHeight * viewport.height / (viewport.height + maxScroll));
            const thumbY = trackY + (trackHeight - thumbHeight) * (uiState.battle.selectScrollY / maxScroll);
            drawPanel(ctx, trackX, trackY, 16, trackHeight, "rgba(0, 0, 0, 0.35)");
            drawPanel(ctx, trackX + 2, thumbY, 12, thumbHeight, "#48e6ff");
        }

        drawInteractivePanel(ctx, closeRect, "#ff4d6d", "#ff6d8a");
        drawText(ctx, "X", closeRect.x + closeRect.width / 2, closeRect.y + closeRect.height / 2, 28, "center");

        drawInteractivePanel(ctx, playRect, canPlay ? "#23c26b" : "#5f6a89", canPlay ? "#31d77d" : "#5f6a89");
        drawText(ctx, window.GameUtils.translate("battle.play"), playRect.x + playRect.width / 2, playRect.y + playRect.height / 2, 34, "center");
        drawText(ctx, selectedCount + "/3", 900, 654, 24, "center");
        ctx.restore();
    }

    function drawBattlePreviewOverlay(ctx) {
        const preview = uiState.battle.matchPreview;
        if (!preview) {
            return;
        }

        const panelRect = { x: 290, y: 154, width: 700, height: 456 };
        const acceptRect = getBattlePreviewAcceptRect();
        const refuseRect = getBattlePreviewRefuseRect();

        ctx.save();
        ctx.fillStyle = "rgba(4, 6, 18, 0.78)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        drawPanel(ctx, panelRect.x, panelRect.y, panelRect.width, panelRect.height, "rgba(18, 30, 78, 0.98)");
        drawText(ctx, window.GameUtils.translate("battle.before_fight"), panelRect.x + panelRect.width / 2, panelRect.y + 44, 34, "center");

        drawPanel(ctx, panelRect.x + 40, panelRect.y + 90, panelRect.width - 80, 146, "rgba(25, 42, 102, 0.9)");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:profile", panelRect.x + 62, panelRect.y + 116, 72, 72, "", "#4964ff");
        drawText(ctx, preview.enemyName, panelRect.x + 168, panelRect.y + 130, 30, "left");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:cup", panelRect.x + 172, panelRect.y + 166, 36, 36, "", "#ffbd2f");
        drawText(ctx, window.GameUtils.formatNumber(preview.enemyCups), panelRect.x + 220, panelRect.y + 184, 24, "left");

        drawPanel(ctx, panelRect.x + 40, panelRect.y + 252, panelRect.width - 80, 70, "rgba(12, 22, 64, 0.96)");
        ctx.save();
        ctx.fillStyle = preview.difficultyColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 34px Arial";
        ctx.fillText(preview.difficultyLabel, panelRect.x + panelRect.width / 2, panelRect.y + 287);
        ctx.restore();

        drawInteractivePanel(ctx, refuseRect, "#d64155", "#ef4b62");
        drawText(ctx, window.GameUtils.translate("battle.refuse"), refuseRect.x + refuseRect.width / 2, refuseRect.y + refuseRect.height / 2, 24, "center");

        drawInteractivePanel(ctx, acceptRect, "#23c26b", "#31d77d");
        drawText(ctx, window.GameUtils.translate("battle.accept"), acceptRect.x + acceptRect.width / 2, acceptRect.y + acceptRect.height / 2, 28, "center");
        ctx.restore();
    }

    function drawBattleBackground(ctx, time) {
        const gradient = ctx.createLinearGradient(0, 0, window.Base.designWidth, window.Base.designHeight);
        gradient.addColorStop(0, "#5d2ac5");
        gradient.addColorStop(0.6, "#772fd8");
        gradient.addColorStop(1, "#28104f");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);

        const bubbleLimit = getPerformanceLimits().bubbleCountBattle;

        ctx.save();
        for (let index = 0; index < bubbleLimit; index += 1) {
            const wave = time * 0.8 + index;
            const x = ((index * 95) % (window.Base.designWidth + 120)) - 60 + Math.sin(wave) * 24;
            const y = ((index * 61 + time * (20 + index % 4) * 8) % (window.Base.designHeight + 140)) - 70;
            const radius = 10 + (index % 5) * 6 + Math.sin(wave * 1.6) * 2;
            ctx.globalAlpha = 0.08 + (index % 3) * 0.03;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawBattleTeam(ctx, team, isPlayer, battleTimeSeconds) {
        team.forEach((fighter, index) => {
            const config = window.Game.getBrawlerConfig(fighter.type);
            const alive = fighter.hp > 0;
            const hpRatio = window.GameUtils.clamp(fighter.hp / fighter.maxHp, 0, 1);
            const idleOff = isReduceAnimations();
            const hover = idleOff ? 0 : Math.sin(battleTimeSeconds * 2 + index * 0.8) * 3;
            const roamX = idleOff ? 0 : Math.sin(battleTimeSeconds * (1.1 + index * 0.12) + index * 2.1) * 16;
            const roamY = idleOff ? 0 : Math.cos(battleTimeSeconds * (1.4 + index * 0.1) + index * 1.7) * 10;
            const hitAge = fighter.hitAt ? (battleTimeSeconds - fighter.hitAt) : 999;
            const hitKick = hitAge < 0.22 ? Math.sin((1 - hitAge / 0.22) * Math.PI * 4) * 6 : 0;
            const recoilX = fighter.recoilX || 0;
            const recoilY = fighter.recoilY || 0;
            const deathProgress = fighter.deathStartedAt
                ? window.GameUtils.clamp((battleTimeSeconds - fighter.deathStartedAt) / 0.9, 0, 1)
                : 0;
            const deathDropY = fighter.deathStartedAt ? deathProgress * 180 : 0;
            const deathSpin = fighter.deathStartedAt ? deathProgress * 1.8 : 0;
            const movementX = (isPlayer ? hitKick : -hitKick) + recoilX + roamX;
            const movementY = hover + recoilY + roamY + deathDropY;
            const centerX = fighter.x + movementX;
            const centerY = fighter.y + movementY;
            ctx.save();
            ctx.translate(centerX, centerY + 1);
            if (deathSpin > 0) {
                ctx.rotate((isPlayer ? -1 : 1) * deathSpin);
            }
            drawPanel(ctx, -82, -73, 164, 146, alive ? "rgba(20, 36, 94, 0.9)" : "rgba(35, 20, 50, 0.72)");
            window.GameAssets.drawImageOrPlaceholder(
                ctx,
                "brawler:" + fighter.type,
                -54,
                -58,
                108,
                108,
                window.GameUtils.translate("brawlers." + config.nameKey),
                "#4c9dff"
            );
            ctx.restore();
            drawText(ctx, "Lv." + fighter.level, centerX, centerY + 54, 16, "center");

            const barX = centerX - 62;
            const barY = centerY + 72;
            drawPanel(ctx, barX, barY, 124, 16, "rgba(0, 0, 0, 0.5)");
            drawPanel(ctx, barX + 2, barY + 2, Math.max(8, 120 * hpRatio), 12, isPlayer ? "#48e6ff" : "#ff6b7a");
            drawText(ctx, "DMG " + Math.round(fighter.damage), centerX, barY + 26, 14, "center");
        });
    }

    function drawBattleProjectiles(ctx, battleTimeSeconds) {
        const now = battleTimeSeconds;
        uiState.battle.projectiles = uiState.battle.projectiles.filter((projectile) => {
            const progress = (now - projectile.startedAt) / projectile.duration;

            if (progress < 0) {
                return true;
            }

            if (progress >= 1) {
                return false;
            }

            const x = projectile.fromX + (projectile.toX - projectile.fromX) * progress;
            const y = projectile.fromY + (projectile.toY - projectile.fromY) * progress;
            const prevProgress = Math.max(0, progress - 0.18);
            const tailX = projectile.fromX + (projectile.toX - projectile.fromX) * prevProgress;
            const tailY = projectile.fromY + (projectile.toY - projectile.fromY) * prevProgress;
            const size = 86;

            if (getPerformanceLimits().drawProjectileTrail) {
                ctx.save();
                ctx.globalAlpha = 0.55;
                const trail = ctx.createLinearGradient(tailX, tailY, x, y);
                trail.addColorStop(0, "rgba(255,255,255,0)");
                trail.addColorStop(1, projectile.neonColor || "#5cf3ff");
                ctx.strokeStyle = trail;
                ctx.lineWidth = 14;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.restore();
            }

            window.GameAssets.drawImageOrPlaceholder(ctx, "effect:bullet", x - size / 2, y - size / 2, size, size, "", "#ffe066");
            return true;
        });
    }

    function drawBattleImpacts(ctx, battleTimeSeconds) {
        uiState.battle.impacts = uiState.battle.impacts.filter((impact) => {
            const progress = (battleTimeSeconds - impact.startedAt) / impact.duration;

            if (progress >= 1) {
                return false;
            }

            const detail = getPerformanceLimits().impactDetail || "full";
            const radius = (impact.isCritical ? 44 : 30) * progress;
            const alpha = 1 - progress;
            ctx.save();
            ctx.globalAlpha = alpha;

            if (detail === "full") {
                const blastSize = (86 + progress * 36) * (impact.explosionScale || 1);
                window.GameAssets.drawImageOrPlaceholder(
                    ctx,
                    "effect:cartoon",
                    impact.x - blastSize / 2,
                    impact.y - blastSize / 2,
                    blastSize,
                    blastSize,
                    "",
                    "rgba(255,255,255,0.2)"
                );
                ctx.fillStyle = impact.isCritical ? "rgba(255, 200, 80, 0.35)" : "rgba(220, 240, 255, 0.25)";
                ctx.beginPath();
                ctx.arc(impact.x, impact.y, radius * 1.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (detail === "simple") {
                ctx.fillStyle = impact.isCritical ? "rgba(255, 200, 80, 0.22)" : "rgba(220, 240, 255, 0.15)";
                ctx.beginPath();
                ctx.arc(impact.x, impact.y, radius * 1.15, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.strokeStyle = impact.isCritical ? "#fff067" : "#ffffff";
            ctx.lineWidth = detail === "minimal" ? 2 : impact.isCritical ? 6 : 4;
            ctx.beginPath();
            ctx.arc(impact.x, impact.y, radius * (detail === "minimal" ? 0.92 : 1), 0, Math.PI * 2);
            ctx.stroke();

            const particleCount = detail === "full" ? 12 : detail === "simple" ? 4 : 0;
            const particleDiv = Math.max(1, particleCount);

            for (let i = 0; i < particleCount; i += 1) {
                const angle = (Math.PI * 2 * i) / particleDiv;
                const dist = 10 + progress * 44;
                const x = impact.x + Math.cos(angle) * dist;
                const y = impact.y + Math.sin(angle) * dist;
                ctx.beginPath();
                ctx.arc(x, y, impact.isCritical ? 4 : 3, 0, Math.PI * 2);
                ctx.fillStyle = impact.isCritical ? "#ffe066" : "#e8f7ff";
                ctx.fill();
            }

            ctx.restore();
            return true;
        });
    }

    function drawBattleDamageTexts(ctx, battleTimeSeconds) {
        uiState.battle.damageTexts = uiState.battle.damageTexts.filter((entry) => {
            const progress = (battleTimeSeconds - entry.startedAt) / entry.duration;
            if (progress >= 1) {
                return false;
            }

            const eased = 1 - Math.pow(1 - progress, 2);
            const y = entry.y - eased * 52;
            const alpha = 1 - progress;
            const scale = 1 + (entry.isCritical ? 0.18 : 0.08) * Math.sin(progress * Math.PI);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(entry.x, y);
            ctx.scale(scale, scale);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (entry.isCritical) {
                ctx.font = "900 20px Arial";
                ctx.lineWidth = 5;
                ctx.strokeStyle = "rgba(60, 0, 0, 0.75)";
                ctx.fillStyle = "#ff4e4e";
                const critText = window.GameUtils.translate("battle.crit");
                ctx.strokeText(critText, 0, -16);
                ctx.fillText(critText, 0, -16);
            }

            ctx.font = "900 26px Arial";
            ctx.lineWidth = 6;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillStyle = entry.isCritical ? "#ffd24a" : "#ffffff";
            ctx.strokeText("-" + entry.amount + " HP", 0, entry.isCritical ? 8 : 0);
            ctx.fillText("-" + entry.amount + " HP", 0, entry.isCritical ? 8 : 0);
            ctx.restore();

            return true;
        });
    }

    function drawBattleIntroOverlay(ctx) {
        const introPlayerName = uiState.battle.playerName.length > 10
            ? uiState.battle.playerName.slice(0, 9) + "..."
            : uiState.battle.playerName;
        const introEnemyName = uiState.battle.enemyName.length > 10
            ? uiState.battle.enemyName.slice(0, 9) + "..."
            : uiState.battle.enemyName;
        drawPanel(ctx, 310, 220, 660, 260, "rgba(10, 15, 42, 0.92)");
        drawText(ctx, window.GameUtils.translate("battle.versus_players"), 640, 262, 44, "center");
        drawPanel(ctx, 330, 302, 250, 106, "rgba(24, 43, 110, 0.9)");
        drawPanel(ctx, 700, 302, 250, 106, "rgba(89, 36, 98, 0.9)");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:profile", 354, 320, 42, 42, "", "#4964ff");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:cup", 354, 368, 34, 34, "", "#ffbd2f");
        drawText(ctx, introPlayerName, 470, 338, 24, "center");
        drawText(ctx, String(window.GameState.cups), 470, 385, 24, "center");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:profile", 724, 320, 42, 42, "", "#4964ff");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:cup", 724, 368, 34, 34, "", "#ffbd2f");
        drawText(ctx, introEnemyName, 840, 338, 24, "center");
        drawText(ctx, String(Math.max(0, uiState.battle.enemyCups || (window.GameState.cups + 5))), 840, 385, 24, "center");
        drawText(ctx, window.GameUtils.translate("battle.players_ready"), 640, 438, 24, "center");
    }

    function drawTeamHeader(ctx, side) {
        const team = side === "player" ? uiState.battle.playerTeam : uiState.battle.enemyTeam;
        const totalHp = team.reduce((sum, fighter) => sum + Math.max(0, fighter.hp), 0);
        const totalMaxHp = team.reduce((sum, fighter) => sum + Math.max(1, fighter.maxHp), 0);
        const totalDamage = team.reduce((sum, fighter) => sum + Math.max(0, Number(fighter.damage) || 0), 0);
        const hpRatio = totalMaxHp > 0 ? window.GameUtils.clamp(totalHp / totalMaxHp, 0, 1) : 0;
        const isPlayer = side === "player";
        const x = isPlayer ? 56 : 744;
        const y = 22;
        const width = 480;
        const name = isPlayer ? uiState.battle.playerName : uiState.battle.enemyName;

        drawPanel(ctx, x, y, width, 56, isPlayer ? "rgba(24, 43, 110, 0.9)" : "rgba(89, 36, 98, 0.9)");
        const displayName = name.length > 12 ? name.slice(0, 11) + "..." : name;
        drawText(ctx, displayName, x + 18, y + 18, 18, "left");
        drawPanel(ctx, x + 12, y + 30, width - 24, 16, "rgba(0, 0, 0, 0.45)");
        drawPanel(
            ctx,
            x + 14,
            y + 32,
            Math.max(8, (width - 28) * hpRatio),
            12,
            isPlayer ? "#48e6ff" : "#ff6b7a"
        );
        drawText(ctx, Math.round(totalHp) + "/" + Math.round(totalMaxHp), x + width - 16, y + 18, 16, "right");
        drawText(
            ctx,
            window.GameUtils.translate("battle.total_damage", { value: Math.round(totalDamage) }),
            x + width / 2,
            y + 50,
            14,
            "center"
        );
    }

    function drawBattleResultOverlay(ctx) {
        const result = uiState.battle.result || { isVictory: false, coins: 0, cups: -3 };
        drawPanel(ctx, 360, 220, 560, 300, "rgba(10, 15, 42, 0.95)");
        drawText(ctx, result.isVictory ? window.GameUtils.translate("battle.victory") : window.GameUtils.translate("battle.defeat"), 640, 280, 44, "center");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:coin", 476, 329, 34, 34, "", "#ffbd2f");
        drawText(ctx, (result.coins >= 0 ? "+" : "") + result.coins, 640, 350, 30, "center");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:cup", 476, 372, 34, 34, "", "#ffbd2f");
        drawText(ctx, (result.cups >= 0 ? "+" : "") + result.cups, 640, 392, 30, "center");
        drawInteractivePanel(ctx, { x: 510, y: 440, width: 260, height: 56 }, "#23c26b", "#31d77d");
        drawText(ctx, window.GameUtils.translate("battle.continue"), 640, 468, 26, "center");
    }

    function drawBattleScene(ctx, time) {
        const battleTimeSeconds = getBattleElapsedSeconds();
        drawBattleBackground(ctx, time);
        drawTeamHeader(ctx, "player");
        drawTeamHeader(ctx, "enemy");
        drawText(ctx, "3 VS 3", 640, 64, 38, "center");
        drawBattleTeam(ctx, uiState.battle.playerTeam, true, battleTimeSeconds);
        drawBattleTeam(ctx, uiState.battle.enemyTeam, false, battleTimeSeconds);
        drawBattleProjectiles(ctx, battleTimeSeconds);
        drawBattleImpacts(ctx, battleTimeSeconds);
        drawBattleDamageTexts(ctx, battleTimeSeconds);

        if (uiState.battle.phase === "intro") {
            drawBattleIntroOverlay(ctx);
        }

        if (uiState.battle.phase === "result") {
            drawBattleResultOverlay(ctx);
        }
    }

    function drawActivePanel(ctx) {
        if (uiState.activePanel === "fighters") {
            drawFightersPanel(ctx);
            return;
        }

        if (uiState.activePanel === "profile") {
            drawProfilePanel(ctx);
            return;
        }

        if (uiState.activePanel === "settings") {
            drawSettingsPanel(ctx);
            return;
        }

        if (uiState.activePanel === "upgrades") {
            drawUpgradesPanel(ctx);
            return;
        }

        if (uiState.activePanel === "leaderboard") {
            drawLeaderboardPanel(ctx);
            return;
        }

        if (uiState.activePanel === "vip") {
            drawVipPanel(ctx);
        }
    }

    function drawBoxOpeningOverlay(ctx, time) {
        if (!uiState.boxOpening.active) {
            return;
        }

        const elapsed = Math.max(0, time - uiState.boxOpening.startedAt);
        const isReveal = elapsed >= uiState.boxOpening.spinDuration;
        const centerX = window.Base.designWidth / 2;
        const centerY = window.Base.designHeight / 2;
        const slotRect = {
            x: centerX - 360,
            y: centerY - 90,
            width: 720,
            height: 180
        };

        if (isReveal && !uiState.boxOpening.revealed) {
            uiState.boxOpening.finalType = getCenteredReelType(slotRect, uiState.boxOpening.stopOffset) || window.BrawlerConfig[0].type;
            uiState.boxOpening.revealed = true;
            uiState.boxOpening.canClose = true;
            window.GameAssets.playSound("win");
        }

        const rewardType = uiState.boxOpening.finalType || window.BrawlerConfig[0].type;
        const rewardConfig = window.Game.getBrawlerConfig(rewardType);

        ctx.save();
        ctx.fillStyle = "rgba(4, 7, 20, 0.88)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);

        drawPanel(ctx, 120, 76, 1040, 568, "rgba(20, 32, 86, 0.95)");
        drawBoxOpeningBubbles(ctx, time, centerX, centerY, isReveal);
        drawText(ctx, window.GameUtils.translate("box.opening_title"), centerX, 130, 42, "center");
        drawText(
            ctx,
            isReveal
                ? window.GameUtils.translate("box.opening_hint_collect")
                : window.GameUtils.translate("box.opening_hint_spin"),
            centerX,
            176,
            24,
            "center"
        );

        if (!isReveal) {
            drawBoxSpinReel(ctx, slotRect, elapsed);
        } else {
            drawBoxReveal(ctx, centerX, centerY, rewardType, rewardConfig, elapsed - uiState.boxOpening.spinDuration);
        }

        ctx.restore();
    }

    function drawBoxOpeningBubbles(ctx, time, centerX, centerY, isReveal) {
        const bubbleCount = Math.max(4, getPerformanceLimits().boxBubbleCount);
        const speed = isReveal ? 0.75 : 1.05;

        ctx.save();
        for (let index = 0; index < bubbleCount; index += 1) {
            const baseAngle = (index / bubbleCount) * Math.PI * 2;
            const wave = time * speed + index * 0.3;
            const radiusOrbit = 170 + (index % 6) * 26 + Math.sin(wave * 0.9) * 18;
            const x = centerX + Math.cos(baseAngle + wave * 0.6) * radiusOrbit;
            const y = centerY + Math.sin(baseAngle + wave * 0.55) * (radiusOrbit * 0.55) - 18;
            const pulse = 1 + Math.sin(wave * 2.1) * 0.2;
            const bubbleRadius = (7 + (index % 4) * 4) * pulse;
            const alpha = 0.12 + (index % 5) * 0.03;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = isReveal ? "#b7f8ff" : "#8ce9ff";
            ctx.beginPath();
            ctx.arc(x, y, bubbleRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawBoxSpinReel(ctx, slotRect, elapsed) {
        const itemWidth = 154;
        const duration = Math.max(0.001, uiState.boxOpening.spinDuration);
        const progress = window.GameUtils.clamp(elapsed / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const offset = uiState.boxOpening.stopOffset * eased;
        const reelTypes = uiState.boxOpening.reelTypes;
        const slotIndex = Math.floor(offset / itemWidth);

        if (slotIndex !== uiState.boxOpening.lastSlotTickIndex) {
            if (slotIndex > uiState.boxOpening.lastSlotTickIndex) {
                window.GameAssets.playSound("click");
            }
            uiState.boxOpening.lastSlotTickIndex = slotIndex;
        }

        drawPanel(ctx, slotRect.x, slotRect.y, slotRect.width, slotRect.height, "rgba(8, 14, 39, 0.9)");

        ctx.save();
        ctx.beginPath();
        ctx.rect(slotRect.x + 18, slotRect.y + 18, slotRect.width - 36, slotRect.height - 36);
        ctx.clip();

        for (let index = -2; index < 9; index += 1) {
            const reelIndex = Math.floor(offset / itemWidth) + index;
            const safeIndex = window.GameUtils.clamp(reelIndex, 0, Math.max(0, reelTypes.length - 1));
            const brawler = window.Game.getBrawlerConfig(reelTypes[safeIndex] || window.BrawlerConfig[0].type);
            const x = slotRect.x + (index * itemWidth) - (offset % itemWidth) + 36;
            const y = slotRect.y + 30;
            window.GameAssets.drawImageOrPlaceholder(
                ctx,
                "brawler:" + brawler.type,
                x,
                y,
                120,
                120,
                window.GameUtils.translate("brawlers." + brawler.nameKey),
                "#4c9dff"
            );
        }

        ctx.restore();
        ctx.strokeStyle = "#48e6ff";
        ctx.lineWidth = 6;
        ctx.strokeRect(slotRect.x + slotRect.width / 2 - 68, slotRect.y + 20, 136, slotRect.height - 40);
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.shadowColor = "#48e6ff";
        ctx.shadowBlur = 14;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(slotRect.x + slotRect.width / 2, slotRect.y + 12);
        ctx.lineTo(slotRect.x + slotRect.width / 2, slotRect.y + slotRect.height - 12);
        ctx.stroke();
        ctx.restore();
    }

    function drawBoxReveal(ctx, centerX, centerY, rewardType, rewardConfig, revealElapsed) {
        const pulse = 1 + Math.sin(revealElapsed * 6) * 0.04;
        const rewardSize = 220 * pulse;
        const lightAlpha = 0.22 + Math.sin(revealElapsed * 5) * 0.07;

        ctx.save();
        ctx.globalAlpha = lightAlpha;
        ctx.fillStyle = "#8df6ff";
        for (let index = 0; index < 12; index += 1) {
            const angle = (index / 12) * Math.PI * 2 + revealElapsed * 0.7;
            const x = centerX + Math.cos(angle) * 146;
            const y = centerY - 12 + Math.sin(angle) * 96;
            ctx.beginPath();
            ctx.arc(x, y, 22 + (index % 3) * 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "brawler:" + rewardType,
            centerX - rewardSize / 2,
            centerY - rewardSize / 2 - 30,
            rewardSize,
            rewardSize,
            window.GameUtils.translate("brawlers." + rewardConfig.nameKey),
            "#4c9dff"
        );
        drawText(ctx, window.GameUtils.translate("brawlers." + rewardConfig.nameKey), centerX, centerY + 132, 38, "center");
        drawText(ctx, window.GameUtils.translate("box.new_brawler"), centerX, centerY + 174, 24, "center");
        drawPanel(ctx, centerX - 156, centerY + 206, 312, 54, "#23c26b");
        drawText(ctx, window.GameUtils.translate("box.collect"), centerX, centerY + 233, 28, "center");
    }

    function drawFightersPanel(ctx) {
        const closeRect = getPanelCloseRect();
        const viewport = getFightersViewportRect();

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        drawPanel(ctx, 158, 70, 964, 592, "rgba(13, 20, 46, 0.96)");
        drawText(ctx, window.GameUtils.translate("fighters.title"), 640, 110, 34, "center");
        drawText(ctx, window.GameUtils.translate("fighters.merge_hint"), 640, 148, 20, "center");

        drawInteractivePanel(ctx, closeRect, "#ff4d6d", "#ff6d8a");
        drawText(ctx, "X", closeRect.x + closeRect.width / 2, closeRect.y + closeRect.height / 2, 30, "center");

        ctx.save();
        ctx.beginPath();
        ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
        ctx.clip();
        ctx.translate(0, -uiState.panel.scrollY);
        window.BrawlerConfig.forEach((brawler, index) => {
            drawFighterCard(ctx, brawler, index);
        });
        ctx.restore();

        drawFightersScrollBar(ctx);

        ctx.restore();
    }

    function drawPanelBase(ctx, title) {
        const bodyRect = getActivePanelBodyRect();
        const closeRect = getPanelCloseRect();
        const titleX = bodyRect.x + bodyRect.width / 2;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        drawPanel(ctx, bodyRect.x, bodyRect.y, bodyRect.width, bodyRect.height, "rgba(13, 20, 46, 0.96)");
        drawText(ctx, title, titleX, 110, 34, "center");
        drawPanel(ctx, closeRect.x, closeRect.y, closeRect.width, closeRect.height, "#ff4d6d");
        drawText(ctx, "X", closeRect.x + closeRect.width / 2, closeRect.y + closeRect.height / 2, 30, "center");
        return bodyRect;
    }

    function drawProfilePanel(ctx) {
        const stats = window.GameState.stats;
        const body = drawPanelBase(ctx, window.GameUtils.translate("profile.title"));
        const rows = [
            [window.GameUtils.translate("profile.clicks"), stats.clicks],
            [window.GameUtils.translate("profile.bought_characters"), stats.boughtCharacters],
            [window.GameUtils.translate("profile.merges"), stats.merges],
            [window.GameUtils.translate("profile.opened_brawlers"), stats.openedBrawlers],
            [window.GameUtils.translate("profile.opened_boxes"), stats.openedBoxes],
            [window.GameUtils.translate("profile.matches"), stats.matches],
            [window.GameUtils.translate("profile.wins"), stats.wins],
            [window.GameUtils.translate("profile.losses"), stats.losses],
            [window.GameUtils.translate("profile.play_time"), formatPlayTime(stats.playTimeSeconds)]
        ];

        rows.forEach((row, index) => {
            const y = body.y + 168 + index * 42;
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(body.x + 56, y - 15, body.width - 112, 30);
            drawText(ctx, row[0], body.x + 74, y, 24, "left");
            drawText(ctx, String(row[1]), body.x + body.width - 76, y, 24, "right");
        });

        ctx.restore();
    }

    function drawSettingsPanel(ctx) {
        const body = drawPanelBase(ctx, window.GameUtils.translate("settings.title"));
        const sliders = [
            { key: "musicVolume", title: window.GameUtils.translate("settings.music"), value: window.GameState.settings.musicVolume },
            { key: "soundVolume", title: window.GameUtils.translate("settings.sound"), value: window.GameState.settings.soundVolume }
        ];

        sliders.forEach((slider, index) => {
            const sliderRect = getSettingsSliderRect(index);
            const knobX = sliderRect.x + sliderRect.width * slider.value;
            drawText(ctx, slider.title, body.x + 180, sliderRect.y - 20, 28, "left");
            drawPanel(ctx, sliderRect.x, sliderRect.y, sliderRect.width, sliderRect.height, "rgba(0, 0, 0, 0.35)");
            drawPanel(ctx, sliderRect.x + 2, sliderRect.y + 2, Math.max(8, sliderRect.width * slider.value - 4), sliderRect.height - 4, "#48e6ff");
            drawPanel(ctx, knobX - 14, sliderRect.y - 14, 28, 44, "#ffffff");
            drawText(ctx, String(Math.round(slider.value * 100)) + "%", body.x + body.width - 150, sliderRect.y - 18, 24, "center");
        });

        const toggleRect = getReduceAnimationsToggleRect();
        const perfOn = Boolean(window.GameState.settings.reduceAnimations);
        const titleCenterX = body.x + body.width / 2;
        drawText(ctx, window.GameUtils.translate("settings.reduce_animations"), titleCenterX, toggleRect.y - 18, 28, "center");
        drawText(ctx, window.GameUtils.translate("settings.reduce_animations_hint"), titleCenterX, toggleRect.y + toggleRect.height + 14, 18, "center");
        drawPanel(ctx, toggleRect.x, toggleRect.y, toggleRect.width, toggleRect.height, "rgba(0, 0, 0, 0.35)");
        const knobWidth = Math.round(toggleRect.width * 0.44);
        const knobX = perfOn ? toggleRect.x + toggleRect.width - knobWidth - 6 : toggleRect.x + 6;
        drawPanel(ctx, knobX, toggleRect.y + 5, knobWidth, toggleRect.height - 10, perfOn ? "#23c26b" : "#5f6a89");
        drawText(
            ctx,
            perfOn ? window.GameUtils.translate("base.yes") : window.GameUtils.translate("base.no"),
            toggleRect.x + toggleRect.width / 2,
            toggleRect.y + toggleRect.height / 2,
            22,
            "center"
        );

        ctx.restore();
    }

    function drawUpgradesPanel(ctx) {
        drawPanelBase(ctx, window.GameUtils.translate("upgrades.title"));
        drawShopTabs(ctx);
        drawPanelScrollableContent(ctx, getShopContentViewportRect(), () => {
            if (uiState.panel.shopTab === "upgrades") {
                drawUpgradeCard(ctx, 0, "clickPower", "ui:click", "upgrades.upgrade_click_power");
                drawUpgradeCard(ctx, 1, "criticalChance", "ui:crit", "upgrades.upgrade_critical_chance");
                drawUpgradeCard(ctx, 2, "passiveIncome", "ui:passive", "upgrades.upgrade_passive_income");
            } else {
                drawInAppsPlaceholder(ctx);
            }
        });
        drawScrollBar(ctx, getShopContentViewportRect(), getMaxUpgradesScrollY());
        ctx.restore();
    }

    function drawShopTabs(ctx) {
        const tabs = getShopTabRects();

        tabs.forEach((tab) => {
            const isActive = uiState.panel.shopTab === tab.id;
            drawInteractivePanel(ctx, tab, isActive ? "#4e73ff" : "rgba(30, 53, 120, 0.86)", "#5e86ff");
            const title = tab.id === "upgrades"
                ? window.GameUtils.translate("menu.upgrades")
                : window.GameUtils.translate("upgrades.inapps_tab");
            drawText(ctx, title, tab.x + tab.width / 2, tab.y + tab.height / 2, 20, "center");
        });
    }

    function drawPanelScrollableContent(ctx, viewport, drawContent) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
        ctx.clip();
        ctx.translate(0, -uiState.panel.scrollY);
        drawContent();
        ctx.restore();
    }

    function drawScrollBar(ctx, viewport, maxScrollY) {
        if (maxScrollY <= 0) {
            return;
        }

        const trackX = viewport.x + viewport.width + 16;
        const trackY = viewport.y;
        const trackHeight = viewport.height;
        const thumbHeight = Math.max(70, trackHeight * viewport.height / (viewport.height + maxScrollY));
        const thumbY = trackY + (trackHeight - thumbHeight) * (uiState.panel.scrollY / maxScrollY);

        drawPanel(ctx, trackX, trackY, 18, trackHeight, "rgba(0, 0, 0, 0.35)");
        drawPanel(ctx, trackX + 2, thumbY, 14, thumbHeight, "#48e6ff");
    }

    function formatShopIapPriceText(pack) {
        const catalog = String(pack?.catalogPrice || "").trim();

        if (catalog) {
            return catalog;
        }

        const pv = Math.max(0, Math.floor(Number(pack?.priceValue) || 0));
        const cur = String(pack?.currencyLabel || "").trim();

        if (pv > 0 && cur) {
            return `${pv} ${cur}`;
        }

        return window.GameUtils.translate("base.loading");
    }

    function formatVipPanelPriceText(vipPackCfg, vipCatalog) {
        const catalog = String(vipCatalog?.price || "").trim();

        if (catalog) {
            return catalog;
        }

        const pv = Math.max(0, Math.floor(Number(vipPackCfg?.priceValue) || 0));
        const cur = String(window.InAppPurchaseConfig?.defaultCurrencyLabel || "").trim();

        if (pv > 0 && cur) {
            return `${pv} ${cur}`;
        }

        return window.GameUtils.translate("base.loading");
    }

    function drawInAppsPlaceholder(ctx) {
        const packs = getInAppsPacks();

        packs.forEach((pack, index) => {
            const card = getInAppsCardRect(index);
            const buttonRect = getInAppsBuyButtonRect(index);
            const isPending = uiState.panel.inAppsPurchasePendingId === (pack.productId || pack.id);
            const isRewarded = pack.purchaseType === "rewarded";
            const rewardTextX = card.x + 24;
            const coinIconCount = Math.max(1, Math.floor(Math.log10(Math.max(1, pack.coinAmount))) - 2);
            const iconSize = 33;
            const iconGap = coinIconCount > 1 ? -18 : 8;
            const iconsStartX = rewardTextX;
            const rewardIconsWidth = iconSize + Math.max(0, coinIconCount - 1) * (iconSize + iconGap);
            const rewardValueX = iconsStartX + rewardIconsWidth + 12;
            const rewardY = card.y + 64;
            drawPanel(ctx, card.x, card.y, card.width, card.height, "rgba(30, 53, 120, 0.86)");
            drawText(ctx, window.GameUtils.translate("upgrades.coin_pack_title"), card.x + 24, card.y + 34, 24, "left");
            for (let iconIndex = 0; iconIndex < coinIconCount; iconIndex += 1) {
                window.GameAssets.drawImageOrPlaceholder(
                    ctx,
                    "ui:coin",
                    iconsStartX + iconIndex * (iconSize + iconGap),
                    rewardY - iconSize / 2,
                    iconSize,
                    iconSize,
                    "",
                    "#ffbd2f"
                );
            }
            drawText(
                ctx,
                window.GameUtils.formatNumber(pack.coinAmount) + " " + window.GameUtils.translate("base.coins"),
                rewardValueX,
                rewardY,
                20,
                "left"
            );
            if (!isRewarded && pack.catalogDescription) {
                const desc = pack.catalogDescription.length > 72
                    ? pack.catalogDescription.slice(0, 69) + "..."
                    : pack.catalogDescription;
                drawText(ctx, desc, card.x + 24, card.y + 86, 14, "left");
            }
            drawInteractivePanel(ctx, buttonRect, isPending ? "#5f6a89" : "#23c26b", isPending ? "#5f6a89" : "#31d77d");
            if (isRewarded && !isPending) {
                drawVideoBadge(ctx, buttonRect.x + 8, buttonRect.y + 8, 24);
            }
            drawText(
                ctx,
                isPending ? "..." : (isRewarded ? window.GameUtils.translate("base.claim") : window.GameUtils.translate("base.buy")),
                buttonRect.x + buttonRect.width / 2 + (isRewarded ? 14 : 0),
                buttonRect.y + buttonRect.height / 2,
                20,
                "center"
            );
            if (!isRewarded) {
                const priceY = buttonRect.y + buttonRect.height + 14;
                const priceText = formatShopIapPriceText(pack);

                drawText(ctx, priceText, buttonRect.x + buttonRect.width / 2, priceY, 18, "center");
            }
        });
    }

    function drawLeaderboardPanel(ctx) {
        drawPanelBase(ctx, window.GameUtils.translate("leaderboard.title"));
        if (uiState.leaderboard.isLoading) {
            drawText(ctx, window.GameUtils.translate("base.loading"), 640, 186, 20, "center");
        }
        drawPanelScrollableContent(ctx, getShopContentViewportRect(), () => {
            const entries = getLeaderboardEntries();
            entries.forEach((entry, index) => {
                drawLeaderboardCard(ctx, entry, index);
            });
        });
        drawScrollBar(ctx, getShopContentViewportRect(), getMaxLeaderboardScrollY());
        ctx.restore();
    }

    function drawLeaderboardCard(ctx, entry, index) {
        const card = getLeaderboardCardRect(index);
        drawPanel(ctx, card.x, card.y, card.width, card.height, "rgba(30, 53, 120, 0.86)");
        drawText(ctx, "#" + entry.rank, card.x + 40, card.y + 37, 24, "center");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:profile", card.x + 70, card.y + 14, 44, 44, "", "#4964ff");
        drawText(ctx, entry.name, card.x + 130, card.y + 28, 22, "left");
        if (entry.accountName) {
            drawText(ctx, entry.accountName, card.x + 130, card.y + 54, 16, "left");
        }
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:cup", card.x + card.width - 130, card.y + 18, 30, 30, "", "#ffbd2f");
        drawText(ctx, window.GameUtils.formatNumber(entry.cups), card.x + card.width - 56, card.y + 34, 22, "right");
    }

    function drawVipPanel(ctx) {
        const body = getVipPanelBodyRect();
        const closeRect = getPanelCloseRect();
        const iconBlockWidth = 250;
        const textBlockX = body.x + iconBlockWidth + 26;
        const textBlockWidth = body.width - iconBlockWidth - 58;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        ctx.fillRect(0, 0, window.Base.designWidth, window.Base.designHeight);
        drawPanel(ctx, body.x, body.y, body.width, body.height, "rgba(30, 53, 120, 0.96)");
        drawPanel(ctx, body.x + 26, body.y + 56, 214, 318, "rgba(20, 36, 90, 0.98)");

        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:vip", body.x + 42, body.y + 92, 170, 170, "", "#9a6cff");

        ctx.save();
        ctx.shadowColor = "#48e6ff";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#7cf8ff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "900 33px Arial";
        ctx.fillText(window.GameUtils.translate("vip.webstatus_forever"), textBlockX, body.y + 66, textBlockWidth);
        ctx.restore();

        const packsCfg = Array.isArray(window.InAppPurchaseConfig?.packs) ? window.InAppPurchaseConfig.packs : [];
        const vipPackCfg = packsCfg.find((p) => p.grantVip);
        const vipProductId = String(
            window.InAppPurchaseConfig?.vipPurchaseProductId ||
                vipPackCfg?.productId ||
                vipPackCfg?.id ||
                "vip_forever"
        ).trim();
        const vipCatalog = window.GameSDK?.getIapCatalogProduct?.(vipProductId);
        const isPurchaseVip = vipPackCfg?.purchaseType === "purchase";
        const isCoinFallbackVip = !vipPackCfg || !isPurchaseVip;
        const canShowPurchaseVip = !isPurchaseVip || isRealMoneyPurchasesAvailable();

        drawText(ctx, window.GameUtils.translate("vip.benefit_income"), textBlockX, body.y + 126, 21, "left");
        drawText(ctx, window.GameUtils.translate("vip.benefit_cooldown"), textBlockX, body.y + 160, 21, "left");
        drawText(ctx, window.GameUtils.translate("vip.benefit_cooldown_line2"), textBlockX, body.y + 188, 21, "left");
        drawText(ctx, window.GameUtils.translate("vip.benefit_discount"), textBlockX, body.y + 216, 21, "left");
        drawText(ctx, window.GameUtils.translate("vip.benefit_discount_line2"), textBlockX, body.y + 244, 21, "left");

        if (!window.GameState.vipPurchased && !isCoinFallbackVip && vipCatalog?.description) {
            const vipDesc = String(vipCatalog.description).length > 90
                ? String(vipCatalog.description).slice(0, 87) + "..."
                : String(vipCatalog.description);
            drawText(ctx, vipDesc, textBlockX, body.y + 272, 15, "left");
        }

        const vipBuyRect = { x: textBlockX, y: body.y + 332, width: textBlockWidth, height: 52 };

        if (!window.GameState.vipPurchased && isCoinFallbackVip) {
            drawText(
                ctx,
                window.GameUtils.formatNumber(window.EconomyConfig.vipPriceCoins),
                textBlockX,
                body.y + 299,
                28,
                "left"
            );
        }

        if (window.GameState.vipPurchased || canShowPurchaseVip) {
            drawInteractivePanel(ctx, vipBuyRect, "#23c26b", "#31d77d");
            drawText(
                ctx,
                window.GameUtils.translate(window.GameState.vipPurchased ? "vip.status_active" : "vip.buy_vip"),
                textBlockX + textBlockWidth / 2,
                body.y + 358,
                23,
                "center"
            );
        }

        if (!window.GameState.vipPurchased && !isCoinFallbackVip && canShowPurchaseVip) {
            const priceLine = formatVipPanelPriceText(vipPackCfg, vipCatalog);
            const priceY = vipBuyRect.y + vipBuyRect.height + 14;

            drawText(ctx, priceLine, textBlockX + textBlockWidth / 2, priceY, 22, "center");
        }

        drawInteractivePanel(ctx, closeRect, "#ff4d6d", "#ff6d8a");
        drawText(ctx, "X", closeRect.x + closeRect.width / 2, closeRect.y + closeRect.height / 2, 30, "center");
        ctx.restore();
    }

    function drawUpgradeCard(ctx, index, upgradeKey, iconKey, titleKey) {
        const card = getUpgradeCardRect(index);
        const buttonRect = getUpgradeButtonRect(index);
        const level = window.Game.getUpgradeLevel(upgradeKey);
        const maxLevel = window.Game.getUpgradeMaxLevel(upgradeKey);
        const price = window.Game.getUpgradePrice(upgradeKey);
        const value = window.Game.getUpgradeCurrentValue(upgradeKey);
        const canUpgrade = Number.isFinite(price) && window.GameState.coins >= price && level < maxLevel;
        const valueText = upgradeKey === "criticalChance"
            ? Math.round(value * 100) + "%"
            : window.GameUtils.formatNumber(value);

        drawPanel(ctx, card.x, card.y, card.width, card.height, "rgba(30, 53, 120, 0.86)");
        window.GameAssets.drawImageOrPlaceholder(ctx, iconKey, card.x + 20, card.y + 20, 92, 92, "", "#4964ff");
        drawText(ctx, window.GameUtils.translate(titleKey), card.x + 138, card.y + 36, 25, "left");
        drawText(ctx, window.GameUtils.translate("upgrades.current_level") + ": " + level + "/" + maxLevel, card.x + 138, card.y + 72, 20, "left");
        drawText(ctx, window.GameUtils.translate("upgrades.current_value") + ": " + valueText, card.x + 138, card.y + 102, 20, "left");

        const pricePanelWidth = 190;
        const pricePanelX = Math.max(card.x + 138, buttonRect.x + buttonRect.width - pricePanelWidth);
        drawPanel(ctx, pricePanelX, card.y + 32, pricePanelWidth, 44, "rgba(0, 0, 0, 0.35)");
        window.GameAssets.drawImageOrPlaceholder(ctx, "ui:coin", pricePanelX + 16, card.y + 39, 30, 30, "", "#ffbd2f");
        drawText(ctx, level >= maxLevel ? "MAX" : window.GameUtils.formatNumber(price || 0), pricePanelX + pricePanelWidth / 2 + 6, card.y + 54, 22, "center");

        drawInteractivePanel(ctx, buttonRect, canUpgrade ? "#23c26b" : "#5f6a89", canUpgrade ? "#31d77d" : "#5f6a89");
        drawText(ctx, window.GameUtils.translate("base.upgrade"), buttonRect.x + buttonRect.width / 2, buttonRect.y + buttonRect.height / 2, 20, "center");
    }

    function formatPlayTime(totalSeconds) {
        const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainSeconds = seconds % 60;
        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(remainSeconds).padStart(2, "0");

        return hh + ":" + mm + ":" + ss;
    }

    function drawFighterCard(ctx, brawler, index) {
        const layout = getFightersLayout();
        const column = index % layout.columns;
        const row = Math.floor(index / layout.columns);
        const x = layout.startX + column * (layout.cardWidth + layout.gap);
        const y = layout.startY + row * (layout.cardHeight + layout.gap);
        const ownedBrawlers = window.GameState?.brawlers || [];
        const maxOwnedLevel = ownedBrawlers.reduce((maxLevel, item) => {
            return Math.max(maxLevel, Math.max(1, Number(item.level) || 1));
        }, 0);
        const unlockedByLevelCount = Math.min(window.BrawlerConfig.length, maxOwnedLevel);
        const isVisible = index < unlockedByLevelCount;

        if (!isVisible) {
            drawPanel(ctx, x, y, layout.cardWidth, layout.cardHeight, "rgba(8, 10, 18, 0.94)");
            drawPanel(ctx, x + 22, y + 20, 64, 50, "rgba(24, 24, 24, 0.9)");
            drawText(ctx, "?", x + 54, y + 45, 36, "center");
            ctx.save();
            ctx.globalAlpha = 0.32;
            drawPanel(ctx, x + 108, y + 24, 180, 180, "rgba(0, 0, 0, 0.75)");
            ctx.restore();
            drawText(ctx, "?", x + layout.cardWidth / 2, y + 120, 68, "center");
            drawText(ctx, window.GameUtils.translate("fighters.locked"), x + layout.cardWidth / 2, y + 220, 30, "center");
            return;
        }

        const maxOwnedTypeLevel = ownedBrawlers
            .filter((item) => item.type === brawler.type)
            .reduce((maxLevel, item) => Math.max(maxLevel, Math.max(1, Number(item.level) || 1)), 0);
        const hierarchyLevel = maxOwnedTypeLevel > 0
            ? maxOwnedTypeLevel
            : window.Game.getBrawlerHierarchyLevel(brawler.type);
        const stats = window.Game.getBrawlerStats(brawler.type, hierarchyLevel);
        const nextType = window.Game.getNextBrawlerType(brawler.type);
        const nextConfig = window.Game.getBrawlerConfig(nextType);

        drawPanel(ctx, x, y, layout.cardWidth, layout.cardHeight, "rgba(32, 52, 112, 0.9)");
        drawPanel(ctx, x + 22, y + 20, 64, 50, "#ffb000");
        drawText(ctx, String(hierarchyLevel), x + 54, y + 45, 30, "center");
        window.GameAssets.drawImageOrPlaceholder(
            ctx,
            "brawler:" + brawler.type,
            x + 116,
            y + 28,
            174,
            174,
            window.GameUtils.translate("brawlers." + brawler.nameKey),
            "#4c9dff"
        );
        drawText(ctx, window.GameUtils.translate("brawlers." + brawler.nameKey), x + layout.cardWidth / 2, y + 220, 30, "center");
        drawText(ctx, stats.hp + " HP / " + stats.damage + " DMG", x + layout.cardWidth / 2, y + 258, 24, "center");

        if (nextType !== brawler.type) {
            drawPanel(ctx, x + 224, y + 24, 176, 52, "rgba(11, 24, 62, 0.74)");
            ctx.save();
            ctx.shadowColor = "rgba(84, 255, 178, 0.5)";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#c6ffd7";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "900 22px Arial";
            ctx.fillText("-> " + window.GameUtils.translate("brawlers." + nextConfig.nameKey), x + 312, y + 50, 166);
            ctx.restore();
        }
    }

    function drawFightersScrollBar(ctx) {
        const maxScrollY = getMaxFightersScrollY();

        if (maxScrollY <= 0) {
            return;
        }

        const viewport = getFightersViewportRect();
        const trackX = viewport.x + viewport.width + 16;
        const trackY = viewport.y;
        const trackHeight = viewport.height;
        const thumbHeight = Math.max(70, trackHeight * viewport.height / (viewport.height + maxScrollY));
        const thumbY = trackY + (trackHeight - thumbHeight) * (uiState.panel.scrollY / maxScrollY);

        drawPanel(ctx, trackX, trackY, 18, trackHeight, "rgba(0, 0, 0, 0.35)");
        drawPanel(ctx, trackX + 2, thumbY, 14, thumbHeight, "#48e6ff");
    }

    function setLoadingProgress(progress) {
        const clamped = window.GameUtils.clamp(Number(progress) || 0, 0, 1);
        const fill = document.getElementById("loading-bar-fill");

        if (fill) {
            fill.style.width = String(Math.round(clamped * 100)) + "%";
        }
    }

    function hideLoading() {
        document.getElementById("loading-screen")?.classList.add("is-hidden");
    }

    window.GameUI = {
        state: uiState,
        init,
        resize,
        setLoadingProgress,
        hideLoading
    };
}());
