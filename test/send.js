


event = require('../lib/saltevents');




event.local({"hello":"world"}, 'tag');
event.master({"hello":"world"}, 'tag');