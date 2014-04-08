


Salt Events
===========

This node module is used to fire off events using the Salt Events System. This enables node applications to send events on the salt events bus.

Salt is a powerful configuration management system and remote execution framework. Salt has many parts, one of which is the Salt Event System. This is a socket bus allowing minions and masters send events/messages.

   * Website: http://www.saltstack.com
   * Repo: https://github.com/saltstack



Requirements
-----------

   * nodejs
   * salt-minion




Installing
-----------

    npm install saltevents



Application Usage
-----------


    // Import the saltevents module
    event = require('saltevents');


    payload = {
      'hello': 'world',
      'status': 'success'
    }

    // Send payload to local bus
    event.local(payload, 'tag');

    // Send payload to the master
    event.master(payload, 'tag');



ToDO
----

   * Use on the command line
   * Send events to the minion from the master
   * Get events from the socket
   * Listen for events on the socket and process it with callback function