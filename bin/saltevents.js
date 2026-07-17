#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { local, master } from '../src/index.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const HELP = `Usage: saltevents <local|master> <json-data> <tag> [options]

Fire an event on the SaltStack event bus.

Commands:
  local     Fire on the local minion bus (salt-call event.fire)
  master    Fire on the master bus (salt-call event.fire_master)

Options:
  --salt-call <path>   Path to the salt-call executable (default: salt-call)
  --sudo               Run salt-call through sudo
  --no-sudo            Do not run salt-call through sudo (master defaults to sudo)
  --timeout <ms>       Kill salt-call after this many milliseconds (default: 30000)
  -h, --help           Show this help
  -v, --version        Show version

Examples:
  saltevents local '{"hello": "world"}' myapp/greeting
  saltevents master '{"status": "success"}' myapp/deploy/done --no-sudo
`;

function fail(message) {
  console.error(`saltevents: ${message}`);
  console.error(`Try 'saltevents --help' for usage.`);
  process.exit(2);
}

let values, positionals;
try {
  ({ values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'salt-call': { type: 'string' },
      sudo: { type: 'boolean' },
      'no-sudo': { type: 'boolean' },
      timeout: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  }));
} catch (error) {
  if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
    fail(error.message);
  }
  throw error;
}

if (values.help) {
  console.log(HELP);
  process.exit(0);
}
if (values.version) {
  console.log(pkg.version);
  process.exit(0);
}

const [command, rawData, tag] = positionals;
if (!command) fail('missing command');
if (command !== 'local' && command !== 'master') fail(`unknown command '${command}'`);
if (rawData === undefined) fail('missing json-data argument');
if (!tag) fail('missing tag argument');

let data;
try {
  data = JSON.parse(rawData);
} catch (error) {
  fail(`json-data is not valid JSON: ${error.message}`);
}

if (values.sudo && values['no-sudo']) fail('--sudo and --no-sudo are mutually exclusive');

const options = {};
if (values['salt-call'] !== undefined) {
  if (values['salt-call'] === '') fail('--salt-call requires a non-empty path');
  options.saltCall = values['salt-call'];
}
if (values['no-sudo']) options.sudo = false;
else if (values.sudo) options.sudo = true;
if (values.timeout !== undefined) {
  options.timeout = Number(values.timeout);
  if (!Number.isFinite(options.timeout) || options.timeout <= 0) {
    fail('--timeout must be a positive number of milliseconds');
  }
}

try {
  const result = await (command === 'local' ? local : master)(data, tag, options);
  console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
} catch (error) {
  console.error(`saltevents: ${error.message}`);
  if (error.stderr) console.error(error.stderr.trim());
  process.exit(1);
}
