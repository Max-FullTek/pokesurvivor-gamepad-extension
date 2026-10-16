# Developer guide

<p><strong>English</strong> · <a href="dev.es.md">Español</a> · <a href="dev.zh-Hant.md">繁體中文</a></p>

[User guide](../README.md)

Build, test and package the extension from source. For installation and everyday use, see the user guide.

## Build and verification

Requires Node.js 20+ and npm.

```sh
npm ci
npm test
npm run build
npm run test:built
npm audit
```

Output: `dist/controller-extension`. The source `extension/` directory alone cannot be loaded as the complete extension. Load the built folder using the [user installation instructions](../README.md#installation). ZIP the built folder for distribution; the build command does not create a ZIP. `dist/` and `node_modules/` are excluded from Git.

Tests simulate gamepads and DOM interactions and do not replace testing with physical controllers. `npm audit` checks known dependency vulnerabilities and is not a security guarantee.

## Project structure

| Path | Purpose |
| --- | --- |
| `extension/` | Website adapter, popup, manifest and icons |
| `js/` and `css/` | Controller engine, preferences and settings interface |
| `assets/controllers/` | Bundled controller artwork and its license |
| `tools/` | Bundle build and built-extension test runner |
| `tests/` | Simulated gamepad and DOM interaction tests |

## Implementation notes

- The only declared permission is `storage`. Content scripts run in an isolated world on the original game's supported pages.
- Bindings use the site's `ps.controller.v1` localStorage key. Enable state and language use `chrome.storage.local`. Site-local storage is accessible to the website and is not encrypted; it must not contain secrets.
- The popup requests the active tab's game language through extension messaging. No cookies, browsing history, account credentials or game saves are intentionally read or changed.

English is the reference for both guides; Spanish and Traditional Chinese translations follow the same content.
