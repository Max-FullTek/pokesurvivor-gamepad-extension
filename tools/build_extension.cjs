const fs = require('node:fs');
const path = require('node:path');
const { minify } = require('terser');
const ROOT = path.join(__dirname, '..');
function content() {
  const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
  const artwork = { xbox: read('assets/controllers/xbox-one.svg') };
  return `(${read('extension/adapter.js')})(G => {\n${read('js/core/gamepad-config.js')}\nG.GamepadArtwork = ${JSON.stringify(artwork)};\n${read('js/ui/gamepad-settings.js')}\n${read('js/core/gamepad.js')}\n});\n`;
}
async function build() {
  const bundled = await minify(content(), { ecma:2020, compress:true, mangle:true });
  const dir = path.join(ROOT, 'dist', 'controller-extension');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'content.js'), bundled.code + '\n');
  for (const name of ['manifest.json', 'popup.html', 'popup.css', 'popup.js', 'icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png', 'LICENSE-Lucide.txt']) fs.copyFileSync(path.join(ROOT, 'extension', name), path.join(dir, name));
  fs.writeFileSync(path.join(dir, 'style.css'), fs.readFileSync(path.join(ROOT, 'extension/style.css'), 'utf8') + '\n' + fs.readFileSync(path.join(ROOT, 'css/controller.css'), 'utf8'));
  for (const name of ['LICENSE', 'LICENSE-NONCOMMERCIAL.md', 'CREDITS.md']) fs.copyFileSync(path.join(ROOT, name), path.join(dir, name));
  fs.copyFileSync(path.join(ROOT, 'assets/controllers/LICENSE-Controllercons.txt'), path.join(dir, 'LICENSE-Controllercons.txt'));
  console.log('Extension ready: dist/controller-extension');
}
if (require.main === module) build().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { content, build };
