import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/saltevents.js', import.meta.url));
const fakeSaltCall = fileURLToPath(new URL('./fixtures/fake-salt-call.js', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function run(args, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [cli, ...args],
      { env: { ...process.env, ...env } },
      (error, stdout, stderr) => {
        // A numeric code is a normal CLI exit; anything else (ENOENT spawn
        // failure, signal kill) is a broken test setup — fail loudly.
        if (error && typeof error.code !== 'number') {
          reject(error);
          return;
        }
        resolve({ code: error ? error.code : 0, stdout, stderr });
      },
    );
  });
}

test('--help prints usage and exits 0', async () => {
  const { code, stdout } = await run(['--help']);
  assert.equal(code, 0);
  assert.match(stdout, /Usage: saltevents <local\|master>/);
});

test('--version prints the package version', async () => {
  const { code, stdout } = await run(['--version']);
  assert.equal(code, 0);
  assert.equal(stdout.trim(), pkg.version);
});

test('local fires event.fire and prints the result', async () => {
  const { code, stdout } = await run([
    'local',
    '{"hello":"world"}',
    'my/tag',
    '--salt-call',
    fakeSaltCall,
  ]);
  assert.equal(code, 0);
  assert.deepEqual(JSON.parse(stdout).argv, [
    '--out',
    'json',
    'event.fire',
    '{"hello":"world"}',
    'my/tag',
  ]);
});

test('master --no-sudo fires event.fire_master directly', async () => {
  const { code, stdout } = await run([
    'master',
    '{"ok":true}',
    'a/b',
    '--no-sudo',
    '--salt-call',
    fakeSaltCall,
  ]);
  assert.equal(code, 0);
  assert.equal(JSON.parse(stdout).argv[2], 'event.fire_master');
});

test('missing command exits 2 with an error', async () => {
  const { code, stderr } = await run([]);
  assert.equal(code, 2);
  assert.match(stderr, /missing command/);
});

test('unknown command exits 2 with an error', async () => {
  const { code, stderr } = await run(['minion', '{}', 'tag']);
  assert.equal(code, 2);
  assert.match(stderr, /unknown command 'minion'/);
});

test('missing tag exits 2 with an error', async () => {
  const { code, stderr } = await run(['local', '{}']);
  assert.equal(code, 2);
  assert.match(stderr, /missing tag/);
});

test('invalid JSON payload exits 2 with an error', async () => {
  const { code, stderr } = await run(['local', 'not json', 'tag']);
  assert.equal(code, 2);
  assert.match(stderr, /json-data is not valid JSON/);
});

test('invalid --timeout exits 2 with an error', async () => {
  const { code, stderr } = await run(['local', '{}', 'tag', '--timeout', 'abc']);
  assert.equal(code, 2);
  assert.match(stderr, /--timeout must be a positive number/);
});

test('empty --salt-call exits 2 instead of falling back to the real salt-call', async () => {
  const { code, stderr } = await run(['local', '{}', 'tag', '--salt-call', '']);
  assert.equal(code, 2);
  assert.match(stderr, /--salt-call requires a non-empty path/);
});

test('conflicting --sudo and --no-sudo exit 2 with an error', async () => {
  const { code, stderr } = await run(['master', '{}', 'tag', '--sudo', '--no-sudo']);
  assert.equal(code, 2);
  assert.match(stderr, /mutually exclusive/);
});

test('unknown option exits 2 with an error instead of crashing', async () => {
  const { code, stderr } = await run(['local', '{}', 'tag', '--bogus']);
  assert.equal(code, 2);
  assert.match(stderr, /saltevents:/);
  assert.doesNotMatch(stderr, /at .*node:internal/);
});

test('salt-call failure exits 1 and reports stderr', async () => {
  const { code, stderr } = await run(
    ['local', '{}', 'tag', '--salt-call', fakeSaltCall],
    { FAKE_SALT_EXIT: '3' },
  );
  assert.equal(code, 1);
  assert.match(stderr, /fake salt-call failure/);
});
