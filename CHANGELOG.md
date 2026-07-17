# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-17

### Changed
- **Breaking:** the package is now an ES module (`"type": "module"`) and
  requires Node.js 20 or later. On Node 20.19+ it can still be loaded with
  `require('saltevents')`.
- **Breaking:** `local()` and `master()` now return a promise that resolves
  with salt-call's parsed JSON output (or raw stdout if not JSON) and rejects
  on failure, instead of logging to the console and returning nothing.
- `local()` and `master()` accept an options object: `saltCall` (path to the
  executable), `sudo`, and `timeout` (ms, default 30000). `master()` still
  uses sudo by default; pass `{ sudo: false }` to disable.
- Both functions reject with a `TypeError` when the tag is missing or empty.
- The library entry point moved from `lib/saltevents.js` to `src/index.js`
  (use the package name to import; the internal path is not part of the API).

### Added
- A working `saltevents` command-line tool (`saltevents <local|master>
  <json-data> <tag>`); the previous release shipped an empty stub.
- Test suite using the built-in `node:test` runner (`npm test`).
- MIT license file, this changelog, and GitHub Actions CI.

### Removed
- **Breaking:** the `minion()` stub, which only printed a placeholder message
  and never fired an event.
- The bundled `test/eventlisten.py` debugging script (Python 2 era). Modern
  Salt ships an equivalent: `salt-run state.event pretty=True`.

## [0.0.3] - 2014-04-08

Historical release: callback-free wrappers around `salt-call event.fire` and
`event.fire_master` that logged output to the console.
