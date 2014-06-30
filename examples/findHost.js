var NOCPS = require('../lib/nocps');

var opts = {
  'hostname': 'xpto.xpto.xpto',
  'username': 'username',
  'password': 'password'
};

var dc1 = new NOCPS(opts);

dc1.findHost('asfaf.sdafsaf.saf', function(host) {
  console.log(host);
  host.getPowerStatus(function(err, data) {
    console.log(data);
  });
});
