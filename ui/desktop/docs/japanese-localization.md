# Japanese Localization

This desktop UI supports Japanese through the existing react-intl catalog flow.

## Scope

Translate user-facing desktop UI text, including buttons, labels, placeholders, dialogs, notifications, tooltips, and accessibility labels.

Do not translate internal prompts, model-facing instructions, system/developer prompts, tool schemas intended for the model, or few-shot examples. Translating those can change agent behavior.

## Files

- src/i18n/index.ts registers supported locales.
- src/i18n/messages/en.json is the extracted source catalog.
- src/i18n/messages/ja.json is the Japanese catalog.
- scripts/i18n-validate-locale.js checks catalog key and placeholder parity for Japanese.

## Validation

Run:

    pnpm run i18n:extract
    pnpm run i18n:compile
    pnpm run i18n:validate-ja

Japanese can be tested with:

    GOOSE_LOCALE=ja pnpm start-gui
    GOOSE_LOCALE=ja-JP pnpm start-gui
    GOOSE_LOCALE=ja_JP pnpm start-gui

## Style

- Keep goose, Goose, tori-goose, MCP, API, JSON, OAuth, CLI, and model/provider names as-is unless the UI context clearly requires Japanese.
- Keep ICU placeholders exactly, for example {error}, {name}, {count, plural, ...}.
- Use concise UI Japanese. Prefer 保存, キャンセル, 削除, 再試行, and 〜できませんでした for failures.

## Native macOS/Electron text

Renderer UI text uses react-intl catalogs. Native main-process text, such as menu labels, startup dialogs, file-picker labels, and notifications, is translated in src/main.ts because it cannot use renderer-only react-intl at runtime. Keep the Japanese entries in that dictionary in sync with any new native labels.
