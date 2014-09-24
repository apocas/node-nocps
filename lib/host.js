var Host = function(mac, modem, callback) {
  this.mac = mac;
  this.modem = modem;

  var self = this;

  this.modem.methodCall('PXE_API.getHost', [this.mac], function(error, value) {
    self.info = value;
    callback(error, value);
  });
};

Host.prototype.getPowerStatus = function(type, callback) {
  this.modem.methodCall('PXE_API.powercontrol', [this.info.mac, 'status', '', type], function(error, value) {
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
  this.modem.methodCall('PXE_API.powercontrol', [this.info.mac, 'on', '', 'apcpdu'], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.powerDownPDU = function(callback) {
  this.modem.methodCall('PXE_API.powercontrol', [this.info.mac, 'off', '', 'apcpdu'], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getProvisioningStatus = function(callback) {
  this.modem.methodCall('PXE_API.getProvisioningStatusByServer', [this.info.mac], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getSensors = function(callback) {
  this.sendCommand('sensor', function(err, data) {
    var lines = data.result.split('\n');
    var sensors = [];
    for (var i = 0; i < lines.length; i++) {
      var aux = lines[i].split('|');
      if (aux.length === 10) {
        var unit = aux[2].trim();
        if (unit == 'degrees C' || unit == 'RPM' || unit == 'Watts' || unit == 'Volts' ) {
          var sensor = {
            'name': aux[0].trim(),
            'value': aux[1].trim(),
            'unit': aux[2].trim(),
            'status': aux[3].trim(),
            'min': aux[4].trim(),
            'low_crit': aux[5].trim(),
            'low_noncrit': aux[6].trim(),
            'up_noncrit': aux[7].trim(),
            'up_crit': aux[8].trim(),
            'max': aux[9].trim()
          };

          if (sensor.min == 'na') {
            sensor.min = Math.min(0, sensor.value);
          }
          if (sensor.max == 'na') {
            switch (unit) {
              case 'degrees C':
                sensor.max = 80;
                break;
              case 'RPM':
                sensor.max = 10000;
                break;
              case 'Watts':
                sensor.max = 1000;
                break;
            }
            sensor.max = Math.max(sensor.max, sensor.value);
            if (sensor.up_crit != 'na') {
              sensor.max = max(sensor.max, sensor.up_crit + 5);
            }
          }

          if (sensor.value != 'na') {
            sensors.push(sensor);
          }
        }
      }
    }

    callback(undefined, sensors);
  });
};

Host.prototype.cancelProvision = function(callback) {
  this.modem.methodCall('PXE_API.cancelProvisioning', [this.info.mac], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.provision = function(hostname, rootpassword, profile, disklayout, callback) {
  var opts = {
    'mac': this.info.mac,
    'hostname': hostname,
    'rootpassword': rootpassword,
    'rootpassword2': rootpassword,
    'rebootmethod': 'auto',
    'profile': profile
  };

  if(disklayout) opts.disk_addon = disklayout;

  this.modem.methodCall('PXE_API.provisionHost', [opts], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getProfiles = function(start, end, callback) {
  this.modem.methodCall('PXE_API.getProfileNames', [start || 0, end || 1000], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getConsoleURL = function(ip, callback) {
  this.modem.methodCall('PXE_API.getConsoleURL', [this.info.mac, '', ip], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getProfile = function(id, callback) {
  this.modem.methodCall('PXE_API.getProfile', [parseInt(id)], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getProfileAddonNames = function(start, end, callback) {
  this.modem.methodCall('PXE_API.getProfileAddonNames', [start || 0, end || 1000], function(error, value) {
    callback(error, value);
  });
};

Host.prototype.getGraph = function(start, end, callback) {
  var today = parseInt(new Date().getTime() / 1000);
  this.modem.methodCall('PXE_API.generateBandwidthGraph', [{
    'host': this.info.mac,
    'start': start || today - (3600 * 24),
    'end': end || today
  }], function(error, value) {
    if (error) return callback(error);
    var buf = new Buffer(value, 'base64');
    callback(undefined, buf);
  });
};

Host.prototype.sendCommand = function(command, callback) {
  this.modem.methodCall('PXE_API.submitIPMI', [{
    'ip': this.info.ipmi_ip,
    'username': this.info.ipmi_user,
    'ipmi_type': this.info.ipmi_type,
    'cmd': command
  }], function(error, value) {
    callback(error, value);
  });
};

module.exports = Host;
