const { spawnSync } = require('node:child_process');
const path = require('node:path');
const result = spawnSync(process.execPath, ['--test', 'tests/controller-preview.test.cjs'], {
  cwd: path.join(__dirname, '..'), env: {...process.env, TEST_BUILT_EXTENSION:'1'}, stdio:'inherit'
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
