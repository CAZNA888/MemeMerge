# Config Reference

All balance values live in `js/config.js`. Change numbers there when you tune the game.

## IAP catalog (`IapCatalogDefinitions` + Bridge)

- `window.IapCatalogDefinitions` in `js/config.js` lists each real-money product `id`, static `cost`, and English `descriptionEn`.
- On startup, `GameSDK` merges this with `bridge.payments.getCatalog()`: platform `price` / `priceCurrencyCode` / `priceValue` override display when present; static values are used in local mode or when the store API fails.
- Product ids must match `playgama-bridge-config.json` → `payments[].id` and `InAppPurchaseConfig.packs[].productId`.

## Base

- `gameTitle` - game title.
- `saveKey` - localStorage key for local fallback saves.
- `saveVersion` - save format version for future migrations.
- `leaderboardName` - leaderboard `id` in `playgama-bridge-config.json` (see Playgama docs).
- `defaultLanguage` - fallback language if auto-detection finds no suitable translation.
- `supportedLanguages` - language allowlist used by auto-detection at first launch.

### Language auto-detection

- At first launch, game tries `navigator.languages` / `navigator.language`.
- Language is accepted only when:
  - code exists in `Base.supportedLanguages`;
  - and dictionary in `js/localization.js` is not empty.
- If no valid language is found, game falls back to `defaultLanguage`, then to `en`, then to `ru`.
- Saved language is normalized to short code (`en-US` -> `en`).
- `designWidth` / `designHeight` - base landscape canvas size.
- `portraitDesignWidth` / `portraitDesignHeight` - base portrait canvas size.
- `minUIScale` / `maxUIScale` - allowed UI scale limits.
- `autosaveIntervalMs` - autosave period in milliseconds.
- `saveDebounceMs` - delay before saving after frequent actions.
- `loadingMinDurationMs` - minimum loading screen duration.

## EconomyConfig

- `startCoins` - coins on a new save.
- `startCups` - cups on a new save.
- `startProgressCubes` - progress cubes on a new save.
- `clickBaseReward` - coins for one regular click.
- `criticalClickChance` - base chance of critical click.
- `criticalClickMultiplier` - critical click reward multiplier.
- `passiveIncomePerSecond` - passive coins per second.
- `characterOfferPrice` - price of a level 1 character offer.
- `progressionBoxRequiredCubes` - cubes needed to open the progression box.
- `adBoxRewardCharacters` - characters received from the ad box.
- `battleCooldownSeconds` - default battle button cooldown.
- `battleWinCoins` - coins for victory.
- `battleLoseCoins` - coins for defeat.
- `battleWinCups` - cups for victory.
- `battleLoseCups` - cups change for defeat.
- `battleWinProgressCubes` - progress cubes for victory.
- `battleLoseProgressCubes` - progress cubes for defeat.
- `vipPriceCoins` - VIP price in coins.
- `vipIncomeMultiplier` - VIP income multiplier.
- `vipBattleCooldownMultiplier` - VIP battle cooldown multiplier.
- `vipShopDiscount` - VIP shop discount.

## UpgradeConfig

- `titleKey` - localization key for upgrade title.
- `icon` - path to upgrade icon.
- `basePrice` - price of the first upgrade level.
- `priceMultiplier` - price growth multiplier.
- `valuePerLevel` - how much value each level adds.
- `maxLevel` - maximum upgrade level.
- `maxValue` - maximum value for capped upgrades.
- `descriptionKey` - localization key for upgrade description.

## BattleConfig

- `teamSize` - selected fighters per team.
- `attackTickMs` - base attack tick in autobattle.
- `bulletSpeed` - bullet animation speed.
- `critDamageMultiplier` - damage multiplier for critical hits.
- `maxBattleDurationMs` - battle timeout.
- `enemyLevelOffsetEasy` - enemy level range for easy battles.
- `enemyLevelOffsetMedium` - enemy level range for medium battles.
- `enemyLevelOffsetHard` - enemy level range for hard battles.

## LevelConfig

- `maxLevel` - maximum fighter level.
- `hpMultiplierPerLevel` - HP growth per level.
- `damageMultiplierPerLevel` - damage growth per level.
- `critBonusPerLevel` - crit chance bonus per level.
- `mergeRequiredSameTypeAndLevel` - whether merge requires same type and level.

## BrawlerConfig

- `id` - internal fighter id.
- `nameKey` - localization key inside `brawlers`.
- `icon` - path to fighter image.
- `baseHp` - level 1 HP.
- `baseDamage` - level 1 damage.
- `baseCritChance` - level 1 crit chance.
- `attackIntervalMs` - attack interval in milliseconds.
- `rarity` - rarity for drops and UI.
