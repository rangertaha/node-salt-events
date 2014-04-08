#!/usr/bin/env node

var ps = require('child_process');


exports.local = function(obj, tag) {
    //salt-call event.fire '{"data": "message to be sent in the event"}' 'tag'

    var msg = JSON.stringify(obj);
        //, tag = 'tag';

    cmd = ps.spawn('salt-call', ['--out', 'json', 'event.fire', msg, tag]);

    cmd.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    cmd.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    cmd.on('error', function (code) {
      console.log('salt-call exited with code ' + code);
    });

    cmd.on('close', function (code) {
      console.log('salt-call exited with code ' + code);
    });

}


exports.master = function(obj, tag) {
    var msg = JSON.stringify(obj);

    cmd = ps.spawn('sudo', ['salt-call', '--out', 'json', 'event.fire_master', msg, tag]);

    cmd.on('error', function (code) {
      console.log('salt-call exited with code ' + code);
    });
}


exports.minion = function(id, msg, tag) {
    console.log("Fire to Minion");
}




