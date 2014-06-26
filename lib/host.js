var Host = function(mac, modem, callback) {
  this.mac = mac;
  this.modem = modem;

  var self = this;

  this.modem.methodCall('PXE_API.getHost', [this.mac], function (error, value) {
    self.info = value;
    callback(error, self);
  });
};

Host.prototype.getPowerStatus = function(callback) {
  this.sendCommand('chassis power status', callback);
};

Host.prototype.softReboot = function(callback) {
  this.sendCommand('chassis power cycle', callback);
};

Host.prototype.hardReboot = function(callback) {
  this.sendCommand('chassis power reset', callback);
};

Host.prototype.powerUp = function(callback) {
  this.sendCommand('chassis power on', callback);
};

Host.prototype.powerDown = function(callback) {
  this.sendCommand('chassis power off', callback);
};

Host.prototype.sendCommand = function(command, callback) {
  client.methodCall('PXE_API.submitIPMI', [{
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
