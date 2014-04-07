var fs = require('fs');

function fire_local(msg, tag) {
    console.log("Fire Locally");
}
exports.local = fire_local;


function fire_to_master(msg, tag) {
   console.log("Fire to Master");
}
exports.master = fire_to_master;


function fire_to_minion(id, msg, tag) {
    console.log("Fire to Minion");
}
exports.minion = fire_to_minion;