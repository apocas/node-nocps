var xmlrpc = require('xmlrpc'),
  Host = require('./host'),
  Device = require('./device'),
  async = require('async');

var NOCPS = function(opts) {
  this.options = {
    host: opts.hostname,
    path: '/xmlrpc.php',
    basic_auth: {
      user: opts.username,
      pass: opts.password
    }
  };

  if(opts.ssl === true) {
    this.client = xmlrpc.createSecureClient(this.options);
  } else {
    this.client = xmlrpc.createClient(this.options);
  }
};

NOCPS.prototype.getHost = function(mac, callback) {
  var aux = new Host(mac, this.client, function(err, host) {
    callback(err, aux);
  });
};

NOCPS.prototype.findHost = function(hostname, callback) {
  var self = this;
  this.getSubnets(undefined, undefined, function(error, subnets) {
    async.detect(subnets.data, function(subnet, icallback) {
      self.getHosts(subnet.subnet, undefined, undefined, function(err, hosts) {
        async.detect(hosts.data, function(host, dcallback) {
          if(host.hostname === hostname) {
            dcallback(true);
          } else {
            dcallback(false);
          }
        }, function(result) {
          if(!result) return icallback(false);
          var aux = new Host(result.mac, self.client, function(data) {
            return callback(aux);
          });
          icallback(true);
        });
      });
    }, function(err, result) {
      if(!result) return callback(undefined);
    });
  });
};

NOCPS.prototype.getDevice = function(identifier) {
  return new Device(identifier, this.client);
};

NOCPS.prototype.getDevices = function(subnet, start, end, callback) {
  this.client.methodCall('PXE_API.getHosts', [subnet, start || 0, end || 1000], function (error, value) {
    callback(error, value);
  });
};

NOCPS.prototype.getHosts = function(subnet, start, end, callback) {
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
