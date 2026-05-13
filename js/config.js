(function () {
    "use strict";

    window.Base = {
        gameTitle: "Мем Бравл: Симулятор Слияния",
        saveKey: "meme_brawl_merge_save",
        saveVersion: 1,
        leaderboardName: "cups",
        defaultLanguage: "ru",
        supportedLanguages: [
            "ru", "en", "es", "tr", "de", "fr", "ar", "az", "zh", "nl",
            "hi", "id", "it", "ja", "ko", "kk", "pl", "pt", "th", "uk", "uz", "vi"
        ],
        designWidth: 1280,
        designHeight: 720,
        portraitDesignWidth: 720,
        portraitDesignHeight: 1280,
        minUIScale: 0.75,
        maxUIScale: 1.35,
        autosaveIntervalMs: 15000,
        saveDebounceMs: 1200,
        loadingMinDurationMs: 150
    };

    window.EconomyConfig = {
        startCoins: 100,
        /** Пока обучение не завершено, монеты не опускаются ниже этого порога (два покупки персонажей и дальше). */
        tutorialPlayMinCoins: 1000,
        startCups: 0,
        startProgressCubes: 0,
        clickBaseReward: 1,
        criticalClickChance: 0.05,
        criticalClickMultiplier: 5,
        passiveIncomePerSecond: 0.2,
        characterOfferPrice: 50,
        progressionBoxRequiredCubes: 30,
        adBoxRewardCharacters: 1,
        battleCooldownSeconds: 30,
        battleWinCoins: 80,
        battleLoseCoins: 20,
        battleWinCups: 10,
        battleLoseCups: -5,
        battleWinProgressCubes: 3,
        battleLoseProgressCubes: 1,
        vipPriceCoins: 5000,
        vipIncomeMultiplier: 2,
        vipBattleCooldownMultiplier: 0.2,
        vipShopDiscount: 0.2
    };

    window.UpgradeConfig = {
        clickPower: {
            titleKey: "upgrade_click_power",
            icon: "assets/images/ui/click.png",
            basePrice: 100,
            priceMultiplier: 1.6,
            valuePerLevel: 1,
            maxLevel: 100,
            descriptionKey: "upgrade_click_power_desc"
        },
        criticalChance: {
            titleKey: "upgrade_critical_chance",
            icon: "assets/images/ui/crit.png",
            basePrice: 250,
            priceMultiplier: 1.8,
            valuePerLevel: 0.01,
            maxValue: 0.5,
            descriptionKey: "upgrade_critical_chance_desc"
        },
        passiveIncome: {
            titleKey: "upgrade_passive_income",
            icon: "assets/images/ui/passive.png",
            basePrice: 300,
            priceMultiplier: 1.7,
            valuePerLevel: 0.2,
            maxLevel: 100,
            descriptionKey: "upgrade_passive_income_desc"
        }
    };

    window.BattleConfig = {
        teamSize: 3,
        attackTickMs: 1000,
        bulletSpeed: 900,
        critDamageMultiplier: 2,
        maxBattleDurationMs: 90000,
        enemyLevelOffsetEasy: [-1, 0],
        enemyLevelOffsetMedium: [0, 1],
        enemyLevelOffsetHard: [1, 3]
    };

    window.LevelConfig = {
        maxLevel: 12,
        hpMultiplierPerLevel: 1.25,
        damageMultiplierPerLevel: 1.2,
        critBonusPerLevel: 0.005,
        mergeRequiredSameTypeAndLevel: true
    };

    window.BrawlerConfig = [
        { id: "brbrpatapim", type: "brbrpatapim", nameKey: "brbrpatapim", icon: "assets/images/brawlers/brbrpatapim.png", baseHp: 100, baseDamage: 12, baseCritChance: 0.05, attackIntervalMs: 1000, rarity: "common", boxDropPercent: 12 },
        { id: "combonagets", type: "combonagets", nameKey: "combonagets", icon: "assets/images/brawlers/combonagets.png", baseHp: 115, baseDamage: 11, baseCritChance: 0.05, attackIntervalMs: 1050, rarity: "common", boxDropPercent: 11 },
        { id: "doge_boss", type: "doge_boss", nameKey: "doge_boss", icon: "assets/images/brawlers/doge_boss.png", baseHp: 140, baseDamage: 16, baseCritChance: 0.04, attackIntervalMs: 1150, rarity: "rare", boxDropPercent: 9 },
        { id: "doge_fee", type: "doge_fee", nameKey: "doge_fee", icon: "assets/images/brawlers/doge_fee.png", baseHp: 95, baseDamage: 17, baseCritChance: 0.08, attackIntervalMs: 950, rarity: "rare", boxDropPercent: 8 },
        { id: "fnaf", type: "fnaf", nameKey: "fnaf", icon: "assets/images/brawlers/fnaf.png", baseHp: 130, baseDamage: 20, baseCritChance: 0.05, attackIntervalMs: 1200, rarity: "epic", boxDropPercent: 7 },
        { id: "granny", type: "granny", nameKey: "granny", icon: "assets/images/brawlers/granny.png", baseHp: 150, baseDamage: 13, baseCritChance: 0.04, attackIntervalMs: 1250, rarity: "rare", boxDropPercent: 7 },
        { id: "gugugaga", type: "gugugaga", nameKey: "gugugaga", icon: "assets/images/brawlers/gugugaga.png", baseHp: 105, baseDamage: 15, baseCritChance: 0.07, attackIntervalMs: 950, rarity: "common", boxDropPercent: 11 },
        { id: "ski_bi_di_toilet", type: "ski_bi_di_toilet", nameKey: "ski_bi_di_toilet", icon: "assets/images/brawlers/skibiditualet.png", baseHp: 110, baseDamage: 16, baseCritChance: 0.06, attackIntervalMs: 1050, rarity: "common", boxDropPercent: 10 },
        { id: "ninja_capuchino", type: "ninja_capuchino", nameKey: "ninja_capuchino", icon: "assets/images/brawlers/ninja_capuchino.png", baseHp: 90, baseDamage: 22, baseCritChance: 0.1, attackIntervalMs: 900, rarity: "epic", boxDropPercent: 6 },
        { id: "paragon", type: "paragon", nameKey: "paragon", icon: "assets/images/brawlers/paragon.png", baseHp: 160, baseDamage: 18, baseCritChance: 0.05, attackIntervalMs: 1200, rarity: "epic", boxDropPercent: 6 },
        { id: "sagur", type: "sagur", nameKey: "sagur", icon: "assets/images/brawlers/sagur.png", baseHp: 120, baseDamage: 14, baseCritChance: 0.06, attackIntervalMs: 1000, rarity: "common", boxDropPercent: 8 },
        { id: "zhdun", type: "zhdun", nameKey: "zhdun", icon: "assets/images/brawlers/zhdun.png", baseHp: 180, baseDamage: 10, baseCritChance: 0.03, attackIntervalMs: 1300, rarity: "rare", boxDropPercent: 5 }
    ];

    /**
     * Статические id / cost (в валюте каталога) и описания на английском.
     * При старте сливаются с ответом bridge.payments.getCatalog() (цены и валюта с платформы имеют приоритет).
     */
    window.IapCatalogDefinitions = {
        coins_10000: {
            cost: 10,
            descriptionEn: "10,000 coins — perfect for a quick boost to upgrades and the merge board."
        },
        coins_100000: {
            cost: 100,
            descriptionEn: "100,000 coins — stock up for serious progression and shop deals."
        },
        coins_1000000: {
            cost: 1000,
            descriptionEn: "1,000,000 coins — go big for maxed upgrades and long-term play."
        },
        vip_forever: {
            cost: 50,
            descriptionEn: "Lifetime VIP — double passive income, shorter battle cooldowns, and a permanent shop discount."
        }
    };

    window.InAppPurchaseConfig = {
        defaultCurrencyLabel: "G",
        /**
         * ID товара «VIP за реальные деньги» в каталоге Playgama Bridge (`payments` в playgama-bridge-config.json).
         * Должен совпадать с productId пакета с grantVip.
         */
        vipPurchaseProductId: "vip_forever",
        /**
         * Запасная цена VIP для подписи в UI, если каталог ещё не подгрузился (локальный режим).
         * В проде показывается строка price из каталога Bridge.
         */
        vipPurchasePriceRubles: 50,
        packs: [
            {
                id: "coins_reward_1000",
                purchaseType: "rewarded",
                coinAmount: 1000,
                priceValue: 0,
                currencyLabel: "REWARD"
            },
            {
                id: "coins_10000",
                productId: "coins_10000",
                purchaseType: "purchase",
                coinAmount: 10000,
                priceValue: 10
            },
            {
                id: "coins_100000",
                productId: "coins_100000",
                purchaseType: "purchase",
                coinAmount: 100000,
                priceValue: 100
            },
            {
                id: "coins_1000000",
                productId: "coins_1000000",
                purchaseType: "purchase",
                coinAmount: 1000000,
                priceValue: 1000
            },
            {
                id: "vip_forever",
                productId: "vip_forever",
                purchaseType: "purchase",
                priceValue: 50,
                grantVip: true
            }
        ]
    };

    window.RemoteFlagsDefaultConfig = {
        characterOfferPrice: String(window.EconomyConfig.characterOfferPrice),
        battleWinCoins: String(window.EconomyConfig.battleWinCoins),
        battleLoseCoins: String(window.EconomyConfig.battleLoseCoins),
        battleWinCups: String(window.EconomyConfig.battleWinCups),
        battleLoseCups: String(window.EconomyConfig.battleLoseCups),
        battleCooldownSeconds: String(window.EconomyConfig.battleCooldownSeconds)
    };

    window.AdConfig = {
        interstitialMinIntervalMs: 60000,
        stickyBannerEnabled: true,
        stickyBannerRecheckMs: 60000
    };

    window.PerformanceConfig = {
        mobileMaxDevicePixelRatio: 1.25,
        desktopMaxDevicePixelRatio: 2,
        reducedAnimationsMobileMaxDpr: 1,
        reducedAnimationsDesktopMaxDpr: 1.25,
        mobileStartTier: 1,
        desktopStartTier: 0,
        fpsSampleMs: 800,
        tierEmergencyFps: 26,
        tierDownFps: 38,
        tierUpFps: 52,
        tierUpMinStableMs: 4500,
        soundThrottleMs: {
            "coin-scatter": 95,
            click: 60,
            shoot: 40,
            button: 48
        },
        tiers: [
            {
                maxCoinFly: 28,
                maxClickEffects: 14,
                maxMergeEffects: 8,
                maxBattleImpacts: 16,
                maxBattleDamageTexts: 16,
                bubbleCountMenu: 44,
                bubbleCountBattle: 36,
                boxBubbleCount: 26,
                drawProjectileTrail: true,
                impactDetail: "full",
                coinBurstMin: 1,
                coinBurstMax: 5,
                coinGlow: true,
                mergeSparkCount: 14
            },
            {
                maxCoinFly: 12,
                maxClickEffects: 8,
                maxMergeEffects: 5,
                maxBattleImpacts: 8,
                maxBattleDamageTexts: 10,
                bubbleCountMenu: 22,
                bubbleCountBattle: 16,
                boxBubbleCount: 14,
                drawProjectileTrail: false,
                impactDetail: "simple",
                coinBurstMin: 1,
                coinBurstMax: 3,
                coinGlow: false,
                mergeSparkCount: 6
            },
            {
                maxCoinFly: 4,
                maxClickEffects: 5,
                maxMergeEffects: 3,
                maxBattleImpacts: 4,
                maxBattleDamageTexts: 6,
                bubbleCountMenu: 10,
                bubbleCountBattle: 8,
                boxBubbleCount: 8,
                drawProjectileTrail: false,
                impactDetail: "minimal",
                coinBurstMin: 0,
                coinBurstMax: 1,
                coinGlow: false,
                mergeSparkCount: 0
            }
        ]
    };

}());
