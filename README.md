


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


Application Usage
-----------

    event = require('../lib/saltevents');




    event.local({"hello":"world"}, 'tag');
    event.master({"hello":"world"}, 'tag');


Shell Usage
-----------


