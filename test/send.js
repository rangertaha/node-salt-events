#!/usr/bin/env node

var saltEvents = require('../lib/saltevents');


payload = {
  'hello': 'world',
  'status': 'success'
}

// Send payload to local bus
saltEvents.local(payload, 'local');

// Send payload to the master
saltEvents.master(payload, 'master');

