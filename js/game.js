(function () {
    "use strict";

    function createDefaultState() {
        const initialLanguage = window.GameLocalization?.resolveInitialLanguage([
            window.GameSDK?.getPreferredLanguage?.()
        ]) || window.Base.defaultLanguage;

        return {
            version: window.Base.saveVersion,
            coins: window.EconomyConfig.startCoins,
            cups: window.EconomyConfig.startCups,
            maxCups: window.EconomyConfig.startCups,
            progressCubes: window.EconomyConfig.startProgressCubes,
            vipPurchased: false,
            brawlers: [],
            upgrades: {
                clickPower: 0,
                criticalChance: 0,
                passiveIncome: 0
            },
            stats: {
                clicks: 0,
                boughtCharacters: 0,
                merges: 0,
                openedBrawlers: 0,
                openedBoxes: 0,
                matches: 0,
                wins: 0,
                losses: 0,
                playTimeSeconds: 0
            },
            settings: {
                music: true,
                sound: true,
                musicVolume: 0.7,
                soundVolume: 0.8,
                language: initialLanguage,
                reduceAnimations: false
            }
        };
    }

    const runtime = {
        dirty: false,
        saveInProgress: false,
        autosaveTimerId: 0,
        debouncedSave: null,
        playTimeAccumulator: 0,
        passiveIncomeAccumulator: 0
    };

    function resolveBrawlerType(type) {
        if (type === "image39") {
            return "ski_bi_di_toilet";
        }

        return type;
    }

    function getBrawlerConfig(type) {
        const resolvedType = resolveBrawlerType(type);

        return window.BrawlerConfig.find((brawler) => brawler.type === resolvedType) || window.BrawlerConfig[0];
    }

    function getBrawlerCycleLength() {
        return Math.max(1, Array.isArray(window.BrawlerConfig) ? window.BrawlerConfig.length : 1);
    }

    function getNextBrawlerType(type) {
        const cycleLength = getBrawlerCycleLength();
        const currentIndex = window.BrawlerConfig.findIndex((brawler) => brawler.type === type);
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = (safeIndex + 1) % cycleLength;
        return window.BrawlerConfig[nextIndex]?.type || window.BrawlerConfig[0].type;
    }

    function getBrawlerHierarchyLevel(type) {
        const index = window.BrawlerConfig.findIndex((brawler) => brawler.type === type);
        const hierarchyLevel = index >= 0 ? index + 1 : 1;

        return window.GameUtils.clamp(hierarchyLevel, 1, window.LevelConfig.maxLevel);
    }

    function getBrawlerStats(type, level) {
        const config = getBrawlerConfig(type);
        const safeLevel = Math.max(1, Number(level) || getBrawlerHierarchyLevel(type));
        const levelIndex = safeLevel - 1;

        return {
            hp: Math.round(config.baseHp * Math.pow(window.LevelConfig.hpMultiplierPerLevel, levelIndex)),
            damage: Math.round(config.baseDamage * Math.pow(window.LevelConfig.damageMultiplierPerLevel, levelIndex)),
            critChance: Math.min(0.95, config.baseCritChance + window.LevelConfig.critBonusPerLevel * levelIndex),
            attackIntervalMs: config.attackIntervalMs
        };
    }

    function createBrawler(type, x, y, level) {
        const config = getBrawlerConfig(type);
        const hierarchyLevel = getBrawlerHierarchyLevel(config.type);
        const safeLevel = Math.max(hierarchyLevel, Number(level) || hierarchyLevel);

        return {
            id: config.type + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
            type: config.type,
            level: safeLevel,
            x,
            y,
            selected: false
        };
    }

    function createStarterBrawlers() {
        const starterTypes = window.BrawlerConfig.slice(0, 3).map((brawler) => brawler.type);
        const positions = [
            { x: 520, y: 300 },
            { x: 640, y: 280 },
            { x: 760, y: 320 }
        ];

        return starterTypes.map((type, index) => {
            return createBrawler(type, positions[index].x, positions[index].y, 1);
        });
    }

    function normalizeBrawler(brawler, index) {
        const fallback = window.BrawlerConfig[index % window.BrawlerConfig.length];
        const type = getBrawlerConfig(resolveBrawlerType(brawler?.type || fallback.type)).type;
        const hierarchyLevel = getBrawlerHierarchyLevel(type);

        return {
            id: brawler?.id || createBrawler(type, 520 + index * 90, 320, brawler?.level || 1).id,
            type,
            level: Math.max(hierarchyLevel, Number(brawler?.level) || hierarchyLevel),
            x: Number.isFinite(brawler?.x) ? brawler.x : 520 + index * 90,
            y: Number.isFinite(brawler?.y) ? brawler.y : 320,
            selected: Boolean(brawler?.selected)
        };
    }

    function getOpenedBrawlersUniqueCount(brawlers) {
        if (!Array.isArray(brawlers) || brawlers.length === 0) {
            return 0;
        }

        const seenTypes = new Set();

        brawlers.forEach((brawler) => {
            if (brawler && typeof brawler.type === "string") {
                seenTypes.add(brawler.type);
            }
        });

        return seenTypes.size;
    }

    function normalizeState(saveData) {
        const defaults = createDefaultState();
        const source = saveData || {};
        const state = Object.assign({}, defaults, source);

        state.upgrades = Object.assign({}, defaults.upgrades, source.upgrades || {});
        state.stats = Object.assign({}, defaults.stats, source.stats || {});
        state.settings = Object.assign({}, defaults.settings, source.settings || {});
        state.brawlers = Array.isArray(source.brawlers)
            ? source.brawlers.map(normalizeBrawler)
            : [];

        if (state.brawlers.length === 0) {
            state.brawlers = createStarterBrawlers();
        }

        state.coins = Math.max(0, Number(state.coins) || 0);
        state.cups = Number(state.cups) || 0;
        state.maxCups = Math.max(Number(state.maxCups) || 0, state.cups);
        state.progressCubes = Math.max(0, Number(state.progressCubes) || 0);
        state.settings.musicVolume = window.GameUtils.clamp(Number(state.settings.musicVolume) || 0, 0, 1);
        state.settings.soundVolume = window.GameUtils.clamp(Number(state.settings.soundVolume) || 0, 0, 1);
        state.settings.music = Boolean(state.settings.music) && state.settings.musicVolume > 0;
        state.settings.sound = Boolean(state.settings.sound) && state.settings.soundVolume > 0;
        state.settings.language = window.GameLocalization?.resolveInitialLanguage([
            window.GameSDK?.getPreferredLanguage?.(),
            state.settings.language
        ]) || window.Base.defaultLanguage;
        state.settings.reduceAnimations = Boolean(state.settings.reduceAnimations);
        state.version = window.Base.saveVersion;

        if (!Number.isFinite(Number(state.stats.openedBrawlers)) || state.stats.openedBrawlers <= 0) {
            state.stats.openedBrawlers = getOpenedBrawlersUniqueCount(state.brawlers);
        }

        return state;
    }

    function serializeState() {
        const state = window.GameState;

        return {
            version: window.Base.saveVersion,
            coins: state.coins,
            cups: state.cups,
            maxCups: state.maxCups,
            progressCubes: state.progressCubes,
            vipPurchased: state.vipPurchased,
            brawlers: state.brawlers.map((brawler) => ({
                id: brawler.id,
                type: brawler.type,
                level: brawler.level,
                x: Math.round(brawler.x),
                y: Math.round(brawler.y),
                selected: Boolean(brawler.selected)
            })),
            upgrades: Object.assign({}, state.upgrades),
            stats: Object.assign({}, state.stats),
            settings: Object.assign({}, state.settings)
        };
    }

    function markDirty() {
        runtime.dirty = true;

        if (runtime.debouncedSave) {
            runtime.debouncedSave();
        }
    }

    async function saveIfDirty(flush) {
        if (!runtime.dirty || runtime.saveInProgress || !window.GameState) {
            return;
        }

        runtime.saveInProgress = true;

        try {
            await window.GameSDK.saveData(serializeState(), Boolean(flush));
            runtime.dirty = false;
        } catch (error) {
            console.warn("Save failed.", error);
        } finally {
            runtime.saveInProgress = false;
        }
    }

    function saveNow() {
        return saveIfDirty(true);
    }

    function addCoins(amount) {
        window.GameState.coins = Math.max(0, window.GameState.coins + amount);
        markDirty();
    }

    function addCups(amount) {
        const previousMaxCups = window.GameState.maxCups;
        const nextCups = Math.max(0, window.GameState.cups + (Number(amount) || 0));
        window.GameState.cups = nextCups;
        window.GameState.maxCups = Math.max(window.GameState.maxCups, nextCups);
        markDirty();

        if (window.GameState.maxCups > previousMaxCups) {
            window.GameSDK.submitLeaderboardScore(window.GameState.maxCups).catch(() => {});
        }

        return nextCups;
    }

    function addProgressCubes(amount) {
        window.GameState.progressCubes = Math.max(0, window.GameState.progressCubes + amount);
        markDirty();
    }

    function applyBattleResult(isVictory, rewardOverrides) {
        const overrides = rewardOverrides || {};
        window.GameState.stats.matches += 1;

        if (isVictory) {
            const winCoins = Number.isFinite(Number(overrides.winCoins))
                ? Number(overrides.winCoins)
                : window.EconomyConfig.battleWinCoins;
            const winCups = Number.isFinite(Number(overrides.winCups))
                ? Number(overrides.winCups)
                : window.EconomyConfig.battleWinCups;
            const winProgressCubes = Number.isFinite(Number(overrides.winProgressCubes))
                ? Number(overrides.winProgressCubes)
                : window.EconomyConfig.battleWinProgressCubes;
            window.GameState.stats.wins += 1;
            addCoins(winCoins);
            addCups(winCups);
            addProgressCubes(winProgressCubes);
        } else {
            const loseCoins = Number.isFinite(Number(overrides.loseCoins))
                ? Number(overrides.loseCoins)
                : window.EconomyConfig.battleLoseCoins;
            const loseCups = Number.isFinite(Number(overrides.loseCups))
                ? Number(overrides.loseCups)
                : window.EconomyConfig.battleLoseCups;
            const loseProgressCubes = Number.isFinite(Number(overrides.loseProgressCubes))
                ? Number(overrides.loseProgressCubes)
                : window.EconomyConfig.battleLoseProgressCubes;
            window.GameState.stats.losses += 1;
            addCoins(loseCoins);
            addCups(loseCups);
            addProgressCubes(loseProgressCubes);
        }

        markDirty();
    }

    function addBrawler(type, x, y, level) {
        const brawler = createBrawler(type, x, y, level);
        const hadTypeBefore = Array.isArray(window.GameState?.brawlers)
            ? window.GameState.brawlers.some((item) => item.type === brawler.type)
            : false;

        window.GameState.brawlers.push(brawler);

        if (!hadTypeBefore) {
            window.GameState.stats.openedBrawlers = Math.max(
                1,
                Number(window.GameState.stats.openedBrawlers) || 0
            ) + 1;
        }

        markDirty();
        return brawler;
    }

    function getBoxDropTable() {
        const available = Array.isArray(window.BrawlerConfig) && window.BrawlerConfig.length > 0
            ? window.BrawlerConfig
            : [{ type: "brbrpatapim" }];
        const entries = available.map((brawler) => ({
            type: brawler.type,
            weight: Math.max(0, Number(brawler.boxDropPercent) || 0)
        }));
        const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);

        if (totalWeight <= 0) {
            const equalWeight = 100 / Math.max(1, entries.length);
            return entries.map((entry) => ({
                type: entry.type,
                weight: equalWeight
            }));
        }

        return entries.map((entry) => ({
            type: entry.type,
            weight: (entry.weight / totalWeight) * 100
        }));
    }

    function getRandomBrawlerTypeForBox() {
        const dropTable = getBoxDropTable();
        const roll = Math.random() * 100;
        let threshold = 0;

        for (let index = 0; index < dropTable.length; index += 1) {
            threshold += dropTable[index].weight;

            if (roll <= threshold) {
                return dropTable[index].type;
            }
        }

        return dropTable[dropTable.length - 1]?.type || "brbrpatapim";
    }

    function claimBoxReward(source) {
        const safeSource = source === "progress" ? "progress" : "ad";
        const rewardCount = safeSource === "ad"
            ? Math.max(1, Number(window.EconomyConfig.adBoxRewardCharacters) || 1)
            : 1;

        if (safeSource === "progress") {
            const required = Number(window.EconomyConfig.progressionBoxRequiredCubes) || 0;

            if (window.GameState.progressCubes < required) {
                return null;
            }

            window.GameState.progressCubes -= required;
        }

        const rewardTypes = [];

        for (let index = 0; index < rewardCount; index += 1) {
            rewardTypes.push(getRandomBrawlerTypeForBox());
        }

        window.GameState.stats.openedBoxes += 1;
        markDirty();

        return {
            source: safeSource,
            rewardTypes
        };
    }

    function buyBrawler(type, x, y) {
        const price = getCharacterOfferPrice();

        if (window.GameState.coins < price) {
            return null;
        }

        window.GameState.coins -= price;
        window.GameState.stats.boughtCharacters += 1;
        return addBrawler(type, x, y, 1);
    }

    function getHighestOwnedBrawlerLevel() {
        if (!Array.isArray(window.GameState?.brawlers) || window.GameState.brawlers.length === 0) {
            return 1;
        }

        return window.GameState.brawlers.reduce((maxLevel, brawler) => {
            return Math.max(maxLevel, Math.max(1, Number(brawler.level) || 1));
        }, 1);
    }

    function getCharacterOfferPrice() {
        const basePrice = Number(window.EconomyConfig.characterOfferPrice) || 50;

        if (window.GameState?.vipPurchased) {
            return basePrice;
        }

        const highestLevel = getHighestOwnedBrawlerLevel();
        return Math.max(basePrice, Math.round(basePrice * highestLevel));
    }

    function buyVip() {
        if (window.GameState.vipPurchased) {
            return { success: true, alreadyOwned: true };
        }

        const price = Number(window.EconomyConfig.vipPriceCoins) || 0;

        if (window.GameState.coins < price) {
            return { success: false, reason: "not_enough_coins" };
        }

        window.GameState.coins -= price;
        window.GameState.vipPurchased = true;
        markDirty();
        return { success: true, alreadyOwned: false };
    }

    function grantCoinPack(amount) {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));

        if (safeAmount <= 0) {
            return 0;
        }

        window.GameState.coins += safeAmount;
        markDirty();
        return safeAmount;
    }

    function grantCoinPackByProductId(productId) {
        const config = window.InAppPurchaseConfig || {};
        const packs = Array.isArray(config.packs) ? config.packs : [];
        const matched = packs.find((pack) => {
            const resolvedProductId = String(pack?.productId || pack?.id || "");
            return resolvedProductId === String(productId || "");
        });

        if (!matched) {
            return false;
        }

        const granted = grantCoinPack(matched.coinAmount);
        return granted > 0;
    }

    function grantVipByProductId(productId) {
        const config = window.InAppPurchaseConfig || {};
        const packs = Array.isArray(config.packs) ? config.packs : [];
        const matched = packs.find((pack) => {
            const resolvedProductId = String(pack?.productId || pack?.id || "");
            return resolvedProductId === String(productId || "");
        });

        if (!matched || !matched.grantVip) {
            return false;
        }

        if (window.GameState.vipPurchased) {
            return false;
        }

        window.GameState.vipPurchased = true;
        markDirty();
        return true;
    }

    function collectBrawlerClickReward(id) {
        const brawler = findBrawlerById(id);

        if (!brawler) {
            return 0;
        }

        const stats = window.Game.getBrawlerStats(brawler.type, brawler.level);
        const baseReward = window.EconomyConfig.clickBaseReward + stats.damage + getUpgradeCurrentValue("clickPower");
        const critChance = window.GameUtils.clamp(window.EconomyConfig.criticalClickChance + getUpgradeCurrentValue("criticalChance"), 0, 0.95);
        const isCritical = Math.random() < critChance;
        const reward = Math.max(1, Math.round(baseReward * (isCritical ? window.EconomyConfig.criticalClickMultiplier : 1)));
        window.GameState.stats.clicks += 1;
        addCoins(reward);

        return reward;
    }

    function findBrawlerById(id) {
        return window.GameState.brawlers.find((brawler) => brawler.id === id) || null;
    }

    function moveBrawler(id, x, y, shouldMarkDirty) {
        const brawler = findBrawlerById(id);

        if (!brawler) {
            return false;
        }

        brawler.x = x;
        brawler.y = y;

        if (shouldMarkDirty) {
            markDirty();
        }

        return true;
    }

    function canMergeBrawlers(source, target) {
        if (!source || !target || source.id === target.id) {
            return false;
        }

        if (!window.LevelConfig.mergeRequiredSameTypeAndLevel) {
            return source.level === target.level;
        }

        return source.type === target.type && source.level === target.level;
    }

    function mergeBrawlers(sourceId, targetId) {
        const source = findBrawlerById(sourceId);
        const target = findBrawlerById(targetId);

        if (!canMergeBrawlers(source, target)) {
            return null;
        }

        const mergedBrawler = createBrawler(
            getNextBrawlerType(target.type),
            (source.x + target.x) / 2,
            (source.y + target.y) / 2,
            target.level + 1
        );
        const selectedCount = [source, target].filter((brawler) => brawler.selected).length;
        mergedBrawler.selected = selectedCount > 0;

        window.GameState.brawlers = window.GameState.brawlers
            .filter((brawler) => brawler.id !== sourceId && brawler.id !== targetId)
            .concat(mergedBrawler);
        window.GameState.stats.merges += 1;
        markDirty();

        return mergedBrawler;
    }

    function getUpgradeConfig(key) {
        return window.UpgradeConfig[key] || null;
    }

    function getUpgradeMaxLevel(key) {
        const config = getUpgradeConfig(key);

        if (!config) {
            return 0;
        }

        if (Number.isFinite(config.maxLevel)) {
            return config.maxLevel;
        }

        if (Number.isFinite(config.maxValue) && Number.isFinite(config.valuePerLevel) && config.valuePerLevel > 0) {
            return Math.floor(config.maxValue / config.valuePerLevel);
        }

        return Number.MAX_SAFE_INTEGER;
    }

    function getUpgradeLevel(key) {
        return Math.max(0, Number(window.GameState.upgrades[key]) || 0);
    }

    function getUpgradeCurrentValue(key) {
        const config = getUpgradeConfig(key);

        if (!config) {
            return 0;
        }

        const level = getUpgradeLevel(key);
        return level * (config.valuePerLevel || 0);
    }

    function getUpgradePrice(key) {
        const config = getUpgradeConfig(key);

        if (!config) {
            return null;
        }

        const level = getUpgradeLevel(key);
        return Math.round(config.basePrice * Math.pow(config.priceMultiplier, level));
    }

    function buyUpgrade(key) {
        const config = getUpgradeConfig(key);

        if (!config) {
            return null;
        }

        const level = getUpgradeLevel(key);
        const maxLevel = getUpgradeMaxLevel(key);

        if (level >= maxLevel) {
            return null;
        }

        const price = getUpgradePrice(key);

        if (!Number.isFinite(price) || window.GameState.coins < price) {
            return null;
        }

        window.GameState.coins -= price;
        window.GameState.upgrades[key] = level + 1;
        markDirty();

        return {
            key,
            level: window.GameState.upgrades[key],
            price
        };
    }

    function setSettingValue(key, value) {
        if (!window.GameState.settings || !(key in window.GameState.settings)) {
            return false;
        }

        if (key === "musicVolume" || key === "soundVolume") {
            const clamped = window.GameUtils.clamp(Number(value) || 0, 0, 1);
            window.GameState.settings[key] = clamped;

            if (key === "musicVolume") {
                window.GameState.settings.music = clamped > 0;
            } else {
                window.GameState.settings.sound = clamped > 0;
            }
        } else if (key === "reduceAnimations") {
            window.GameState.settings.reduceAnimations = Boolean(value);
        } else if (key === "language") {
            const resolved =
                window.GameLocalization?.resolveInitialLanguage?.([value]) ||
                window.GameLocalization?.normalizeLanguageCode?.(value) ||
                String(value || "").trim().toLowerCase().split(/[-_]/)[0];
            window.GameState.settings[key] = resolved || window.Base.defaultLanguage;
        } else {
            window.GameState.settings[key] = value;
        }

        markDirty();
        return true;
    }

    function getPassiveIncomePerSecond() {
        const baseIncome = window.EconomyConfig.passiveIncomePerSecond + getUpgradeCurrentValue("passiveIncome");
        const vipMultiplier = window.GameState.vipPurchased ? window.EconomyConfig.vipIncomeMultiplier : 1;
        return Math.max(0, baseIncome * vipMultiplier);
    }

    function tick(deltaSeconds) {
        const safeDelta = Math.max(0, Number(deltaSeconds) || 0);

        if (safeDelta <= 0) {
            return;
        }

        let shouldMarkDirty = false;
        runtime.playTimeAccumulator += safeDelta;
        runtime.passiveIncomeAccumulator += safeDelta * getPassiveIncomePerSecond();

        if (runtime.playTimeAccumulator >= 1) {
            const wholeSeconds = Math.floor(runtime.playTimeAccumulator);
            window.GameState.stats.playTimeSeconds += wholeSeconds;
            runtime.playTimeAccumulator -= wholeSeconds;
            shouldMarkDirty = true;
        }

        if (runtime.passiveIncomeAccumulator >= 1) {
            const passiveCoins = Math.floor(runtime.passiveIncomeAccumulator);
            window.GameState.coins += passiveCoins;
            runtime.passiveIncomeAccumulator -= passiveCoins;
            shouldMarkDirty = true;
        }

        if (shouldMarkDirty) {
            markDirty();
        }
    }

    function startAutosave() {
        window.clearInterval(runtime.autosaveTimerId);
        runtime.autosaveTimerId = window.setInterval(() => {
            saveIfDirty(false);
        }, window.Base.autosaveIntervalMs);
    }

    async function init() {
        const saveData = await window.GameSDK.loadSave();
        window.GameState = normalizeState(saveData);
        runtime.debouncedSave = window.GameUtils.createDebounce(() => {
            saveIfDirty(false);
        }, window.Base.saveDebounceMs);
        startAutosave();

        if (!saveData) {
            markDirty();
        }

        window.GameSDK.claimPendingPurchases((productId) => {
            if (grantCoinPackByProductId(productId)) {
                return true;
            }

            if (grantVipByProductId(productId)) {
                return true;
            }

            return false;
        }).catch(() => {});

        return window.GameState;
    }

    window.Game = {
        runtime,
        createDefaultState,
        createBrawler,
        getBrawlerConfig,
        getOpenedBrawlersUniqueCount,
        getNextBrawlerType,
        getBrawlerHierarchyLevel,
        getBrawlerStats,
        normalizeState,
        markDirty,
        saveIfDirty,
        saveNow,
        addCoins,
        addCups,
        addProgressCubes,
        applyBattleResult,
        addBrawler,
        getHighestOwnedBrawlerLevel,
        getCharacterOfferPrice,
        buyVip,
        grantCoinPack,
        grantCoinPackByProductId,
        grantVipByProductId,
        getBoxDropTable,
        claimBoxReward,
        buyBrawler,
        getUpgradeLevel,
        getUpgradeMaxLevel,
        getUpgradeCurrentValue,
        getUpgradePrice,
        buyUpgrade,
        setSettingValue,
        getPassiveIncomePerSecond,
        collectBrawlerClickReward,
        findBrawlerById,
        moveBrawler,
        canMergeBrawlers,
        mergeBrawlers,
        tick,
        init
    };
}());
