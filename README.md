# Salt Events

[![CI](https://github.com/rangertaha/node-salt-events/actions/workflows/ci.yml/badge.svg)](https://github.com/rangertaha/node-salt-events/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/saltevents.svg)](https://www.npmjs.com/package/saltevents)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Fire events on the [SaltStack](https://saltproject.io) event bus from Node.js.

Salt is a configuration management system and remote execution framework. Its
event system is a message bus that masters and minions use to communicate.
This module lets a Node.js application publish events onto that bus by
shelling out to `salt-call`.

## Requirements

- Node.js 20 or later
- `salt-minion` installed on the host (the `salt-call` executable must be
  available)

## Installation

```sh
npm install saltevents
```

## Usage

```js
import { local, master } from 'saltevents';

const payload = { hello: 'world', status: 'success' };

// Fire on the local minion event bus (salt-call event.fire)
await local(payload, 'myapp/greeting');

// Fire on the master event bus (salt-call event.fire_master, via sudo)
await master(payload, 'myapp/deploy/done');
```

Both functions return a promise that resolves with salt-call's parsed JSON
output (or the raw stdout if it isn't JSON) and rejects if salt-call fails.
Rejection errors carry `stdout` and `stderr` properties.

An optional third argument tunes how salt-call is invoked:

```js
await master(payload, 'myapp/deploy/done', {
  saltCall: '/usr/local/bin/salt-call', // default: 'salt-call'
  sudo: false,                          // default: true for master(), false for local()
  timeout: 10_000,                      // ms before salt-call is killed, default: 30000
});
```

## Command line

The package installs a `saltevents` command:

```sh
saltevents local '{"hello": "world"}' myapp/greeting
saltevents master '{"status": "success"}' myapp/deploy/done --no-sudo
```

Run `saltevents --help` for all options.

## Watching events

To verify events are arriving, run the event viewer that ships with Salt on
the master:

```sh
salt-run state.event pretty=True
```

## Development

```sh
npm test
```

## License

[MIT](LICENSE)
