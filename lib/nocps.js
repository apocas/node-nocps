var NOCPS = function(opts) {
  this.options = {
    host: opts.host,
    path: '/xmlrpc.php',
    basic_auth: {
      user: opts.username,
      pass: opts.password
    }
  };

  if(opts.ssl === true) {
    this.client = xmlrpc.createSecureClient(options);
  } else {
    this.client = xmlrpc.createClient(options);
  }
};

NOCPS.prototype.getHost = function(mac, callback) {
  new Host(mac, modem, function(err, host) {
    callback(err, host);
  });
};

NOCPS.prototype.getDevice = function(identifier) {
  return new Host(identifier, modem);
};

NOCPS.prototype.getDevices = function(subnet, start, end) {
  this.client.methodCall('PXE_API.getHosts', [subnet, start || 0, end || 1000], function (error, value) {
    callback(error, value);
  });
};

NOCPS.prototype.getHosts = function(subnet, start, end) {
  this.client.methodCall('PXE_API.getHosts', [subnet, start || 0, end || 1000], function (error, value) {
    callback(error, value);
  });
};

NOCPS.prototype.getSubnets = function(start, end, callback) {
  this.client.methodCall('PXE_API.getSubnets', [start || 0, end || 1000], function (error, value) {
    callback(error, value);
  });
};

module.exports = NOCPS;
