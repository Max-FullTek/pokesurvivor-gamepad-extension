<p align="center"><img src="extension/icon-128.png" width="80" height="80" alt="Gamepad extension icon"></p>
<h1 align="center">PokéSurvivor Gamepad Extension</h1>
<p align="center"><strong>English</strong> · <a href="README.es.md">Español</a> · <a href="README.zh-Hant.md">繁體中文</a></p>

<p align="center">Play PokéSurvivor with your gamepad. Make the controls your own.</p>

Unofficial Chrome / Edge extension for the [original game](https://pokesurvivor.com/), with custom bindings, a guided setup wizard and stick calibration. Maintained independently from the game.

[Features](#features) · [Installation](#installation) · [Controls](#controls) · [Privacy and security](#privacy-and-security) · [Developer guide](docs/dev.md) · [License and disclaimer](#license-and-disclaimer)

## Features

- Separate gameplay and menu bindings, with a step-by-step setup wizard.
- Left / right stick calibration, adjustable deadzone and movement modes.
- English, Spanish and Traditional Chinese interfaces; Automatic follows the game language, with English as the fallback.
- Toolbar toggle to disable gamepad support while keeping your settings.

> Interface language affects this extension only. Traditional Chinese game text requires the separate [translation extension](https://github.com/q86865511/pokesurvivor-zh-hant/tree/main/pokesurvivor-zh-ext), which is not bundled here.

## Installation

1. Extract a provided extension ZIP, or [build from source](docs/dev.md). GitHub's **Download ZIP** contains source code and must be built first.
2. Open `chrome://extensions` or `edge://extensions` and enable **Developer mode**.
3. Choose **Load unpacked**, then select the built `controller-extension` folder containing `manifest.json`. For a source build, this is `dist/controller-extension`.
4. Open or refresh [PokéSurvivor](https://pokesurvivor.com/). Connect a gamepad and press a button.
5. Open **Settings → Controls → On PC → Controller → Gamepad settings** in the game. Use the toolbar popup for the enable switch and interface language.

After updating, reload the extension on the extensions page and refresh the game tab. To stop using it, turn off the toolbar switch or disable / remove the extension in the browser.

## Controls

| Input (Xbox positions) | Default action |
| --- | --- |
| Left stick / D-pad | Move; navigate menus |
| A / B / X / Y | Moves 3 / 2 / 4 / 1 |
| Right stick | Four-way move selection |
| LB / RB | Previous / next move |
| Start | Pause / back |
| A / B in menus | Confirm / back |
| X in the level-up menu | Reroll cards |

Click a diagram button to change its function, or use **Setup wizard**. Edits apply only after **Save**; **Cancel** keeps the previous settings. Stick movement and stick presses are configured separately. The Guide / Xbox system button is excluded.

Only browser gamepads using the `standard` mapping are supported. The diagram uses Xbox positions for all supported controllers. On the original website, movement becomes eight-direction keyboard input without analog speed. Website updates can affect compatibility; recognized native gamepad support takes priority.

## Privacy and security

- The only declared permission is `storage`. The extension runs only on supported pages of the original game.
- No analytics, telemetry, remote script loading or background data uploads are implemented. Related links open only when clicked.
- The extension reads controller input and temporarily tracks held keyboard keys to avoid interrupting your keyboard controls. It does not record typed text or persist keyboard history.
- Bindings are stored locally by the game website; enable state and interface language are stored locally by the extension. Website settings are accessible to the website and are not encrypted.
- The popup checks the active game tab’s language. No cookies, browsing history, account credentials or game saves are intentionally read or changed.

Use trusted builds. A clean dependency scan is not a security guarantee. For ordinary bugs, use this repository's [Issues](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension/issues). Do not post passwords, tokens, saves, personal paths or exploitable vulnerability details publicly. If GitHub offers **Security → Report a vulnerability** for this repository, use that private channel; otherwise first request a private contact without disclosing the details.

See the [developer guide](docs/dev.md) for source builds, tests and the project structure.

## License and disclaimer

**Source available for noncommercial use.** Code retains the upstream [PolyForm Noncommercial 1.0.0 terms](LICENSE-NONCOMMERCIAL.md) and [license notices](LICENSE). Redistribution must preserve applicable terms, required notices and third-party attributions. Public availability does not grant unrestricted commercial use. Controllercons artwork and the adapted Lucide icon have separate licenses; see [CREDITS.md](CREDITS.md). The retained upstream LICENSE also describes historical licenses and game assets not included here.

This is an unofficial community project, not affiliated with, endorsed by or sponsored by the original game author, Nintendo, Creatures Inc., GAME FREAK, The Pokémon Company, Microsoft or other platform / controller vendors. Game code, artwork, names and trademarks remain with their respective rights holders. No license to third-party brands or game content is granted by this project.

To the extent permitted by applicable law, the software is provided **as is**, without warranties of compatibility, availability, security or fitness for a particular purpose. Use may be interrupted by browser or website changes. Liability is limited only as permitted by applicable law and the applicable licenses; these statements do not override mandatory rights or license obligations.

For an ownership or licensing concern, contact the maintainer through the repository without posting private information. These notes summarize the project and do not replace the full license texts. If a translation conflicts with a license, the license text controls.

## Related projects

1. [Original game website](https://pokesurvivor.com/)
2. [Original game repository — JPTER78](https://github.com/JPTER78/pokesurvivor)
3. [Traditional Chinese translation extension](https://github.com/q86865511/pokesurvivor-zh-hant/tree/main/pokesurvivor-zh-ext)
4. [This extension repository](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension)
