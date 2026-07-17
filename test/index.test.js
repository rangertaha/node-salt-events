import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { local, master } from '../src/index.js';

const fakeSaltCall = fileURLToPath(new URL('./fixtures/fake-salt-call.js', import.meta.url));
const fakePathDir = fileURLToPath(new URL('./fixtures/path', import.meta.url));

// Prepend the fixtures/path dir (containing a fake sudo) to PATH for the
// duration of the test.
function useFakePath(t) {
  const originalPath = process.env.PATH;
  process.env.PATH = `${fakePathDir}${path.delimiter}${originalPath}`;
  t.after(() => {
    process.env.PATH = originalPath;
  });
}

test('local fires event.fire with the JSON payload and tag', async () => {
  const result = await local({ hello: 'world' }, 'my/tag', { saltCall: fakeSaltCall });
  assert.deepEqual(result.argv, [
    '--out',
    'json',
    'event.fire',
    '{"hello":"world"}',
    'my/tag',
  ]);
});

test('master fires event.fire_master', async () => {
  const result = await master({ ok: true }, 'a/b', { saltCall: fakeSaltCall, sudo: false });
  assert.deepEqual(result.argv, [
    '--out',
    'json',
    'event.fire_master',
    '{"ok":true}',
    'a/b',
  ]);
});

test('resolves with raw trimmed stdout when output is not JSON', async (t) => {
  process.env.FAKE_SALT_OUTPUT = 'plain text output';
  t.after(() => {
    delete process.env.FAKE_SALT_OUTPUT;
  });
  const result = await local({}, 'tag', { saltCall: fakeSaltCall });
  assert.equal(result, 'plain text output');
});

test('rejects when tag is missing or empty', async () => {
  await assert.rejects(local({}, ''), TypeError);
  await assert.rejects(local({}), TypeError);
});

test('rejects when salt-call exits non-zero, exposing stderr', async (t) => {
  process.env.FAKE_SALT_EXIT = '2';
  t.after(() => {
    delete process.env.FAKE_SALT_EXIT;
  });
  await assert.rejects(
    local({}, 'tag', { saltCall: fakeSaltCall }),
    (error) => {
      assert.equal(error.code, 2);
      assert.match(error.stderr, /fake salt-call failure/);
      return true;
    },
  );
});

test('rejects when salt-call cannot be spawned', async () => {
  await assert.rejects(local({}, 'tag', { saltCall: '/nonexistent/salt-call' }), {
    code: 'ENOENT',
  });
});

test('master runs through sudo by default', async (t) => {
  useFakePath(t);
  const result = await master({ ok: true }, 'a/b', { saltCall: fakeSaltCall });
  assert.deepEqual(result.sudoArgv, [
    fakeSaltCall,
    '--out',
    'json',
    'event.fire_master',
    '{"ok":true}',
    'a/b',
  ]);
});

test('local does not use sudo unless asked', async (t) => {
  useFakePath(t);
  const result = await local({}, 'tag', { saltCall: fakeSaltCall });
  assert.equal(result.sudoArgv, undefined);
  assert.equal(result.argv[2], 'event.fire');
});

test('kills salt-call and rejects when the timeout elapses', async (t) => {
  process.env.FAKE_SALT_SLEEP = '10000';
  t.after(() => {
    delete process.env.FAKE_SALT_SLEEP;
  });
  await assert.rejects(
    local({}, 'tag', { saltCall: fakeSaltCall, timeout: 250 }),
    (error) => {
      assert.equal(error.killed, true);
      return true;
    },
  );
});
