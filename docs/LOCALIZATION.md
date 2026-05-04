# Localization Guide

Localization data lives in `js/localization.js`.

## Language codes

- `ru` - Russian
- `en` - English
- `tr` - Turkish
- `es` - Spanish
- `it` - Italian
- `fr` - French
- `de` - German
- `ar` - Arabic
- `az` - Azerbaijani
- `zh` - Chinese
- `nl` - Dutch
- `hi` - Hindi (Indian)
- `id` - Indonesian
- `ja` - Japanese
- `ko` - Korean
- `kk` - Kazakh
- `pl` - Polish
- `pt` - Portuguese
- `th` - Thai
- `uk` - Ukrainian
- `uz` - Uzbek
- `vi` - Vietnamese

## How language is selected

1. On first launch, game checks browser language list (`navigator.languages`, `navigator.language`).
2. A language is used only if:
   - it is present in `Base.supportedLanguages` (`js/config.js`);
   - and it has a non-empty dictionary in `window.Localization`.
3. If no valid match is found, fallback order is:
   - `Base.defaultLanguage`
   - `en`
   - `ru`

The language is stored in save data (`GameState.settings.language`) and normalized to short code (for example, `en-US` -> `en`).

## Adding a new translation

1. Add language code to `Base.supportedLanguages` in `js/config.js` (if missing).
2. Create dictionary in `window.Localization` in `js/localization.js`:
   - `base`
   - `menu`
   - `profile`
   - `settings`
   - `upgrades`
   - `fighters`
   - `battle`
   - `box`
   - `leaderboard`
   - `vip`
   - `brawlers`
3. Ensure dictionary is not empty, otherwise auto-detection skips it.

## Current translation coverage

- Full key coverage is available for all supported languages.
- Base translation dictionaries: `ru`, `en`.
- Other languages use complete locale packs built from `en` plus translated UI overrides.
- If any specific key is missing in a locale override, it is safely inherited from `en`.

## Fallback behavior

- `GameUtils.translate()` first tries active language dictionary.
- If key is missing, it falls back to `en`, then to `ru`, then returns the key itself.
- This guarantees that UI remains readable even if some keys are missing.
