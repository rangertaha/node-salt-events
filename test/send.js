#!/usr/bin/env node

event = require('../lib/saltevents');


payload = {
  'hello': 'world',
  'status': 'success'
}

// Send payload to local bus
event.local(payload, 'tag');

// Send payload to the master
event.master(payload, 'tag');

