var Host = function(mac, modem, callback) {
  this.mac = mac;
  this.modem = modem;

  var self = this;

  this.modem.methodCall('PXE_API.getHost', [this.mac], function (error, value) {
    self.info = value;
    callback(error, value);
  });
};

Host.prototype.getPowerStatus = function(type, callback) {
  this.modem.methodCall('PXE_API.powercontrol', [this.info.mac, 'status', '', type], function (error, value) {
    callback(error, value);
  });
};

Host.prototype.powerReset = function(callback) {
  this.sendCommand('chassis power reset', callback);
};

Host.prototype.powerCycle = function(callback) {
  this.sendCommand('chassis power cycle', callback);
};

Host.prototype.powerUp = function(callback) {
  this.sendCommand('chassis power on', callback);
};

Host.prototype.powerDown = function(callback) {
  this.sendCommand('chassis power off', callback);
};

Host.prototype.powerUpPDU = function(callback) {
  this.modem.methodCall('PXE_API.powercontrol', [this.info.mac, 'on', '', 'apcpdu'], function (error, value) {
    callback(error, value);
  });
};

Host.prototype.powerDownPDU = function(callback) {
  this.modem.methodCall('PXE_API.powercontrol', [this.info.mac, 'off', '', 'apcpdu'], function (error, value) {
      callback(error, value);
    }
  );
};

Host.prototype.getGraph = function(start, end, callback) {
  var today = parseInt(new Date().getTime()/ 1000);
  this.modem.methodCall('PXE_API.generateBandwidthGraph', [{
      'host': this.info.mac,
      'start': start || today - (3600 * 24),
      'end': end || today
    }], function (error, value) {
      var buf = new Buffer(value, 'base64');
      callback(error, buf);
    }
  );
};

Host.prototype.sendCommand = function(command, callback) {
  this.modem.methodCall('PXE_API.submitIPMI', [{
      'ip': this.info.ipmi_ip,
      'username': this.info.ipmi_user,
      'ipmi_type': this.info.ipmi_type,
      'cmd': command
    }], function (error, value) {
      callback(error, value);
    }
  );
};

module.exports = Host;
