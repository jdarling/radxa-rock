var CONST = require('./gpio_defines');
var GPIO_PATH = CONST.GPIO_PATH;
var NOOP = function(){};
var utils = require('./utils');
var _export = utils.export;
var _unexport = utils.unexport;
var _read = utils.read;
var _write = utils.write;

var isNumeric = function(n){
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var Pin = function(opts){
  var self = this;
  var options = isNumeric(opts)?{pin: opts}:opts;
  var pinNumber = options.pin;
  if(!pinNumber){
    throw new Error('No pin number supplied!');
  }
  self._pin = pinNumber;
  self._gpioPath = GPIO_PATH + 'gpio'+ pinNumber;
};

Pin.prototype.export = function(callback){
  var self = this;
  _export(self._pin, callback);
};

Pin.prototype.unexport = function(pinNumber, callback){
  var self = this;
  _unexport(self._pin, callback);
};

Pin.prototype.getMode = function(callback){
  var self = this;
  var path = self._gpioPath + '/direction';
  try{
    if(callback){
      return _read(path, function(err, dir){
        return callback(null, (dir||'undefined').trim());
      });
    }
    return _read(path);
  }catch(e){
    return 'undefined';
  }
};

Pin.prototype.setMode = function(pinNumber, direction, callback){
  var self = this;
  var mode = direction === 'in' || direction === 'input' ? 'in':'out';
  var path = self._gpioPath + '/direction';
  var checkErrorSendMode = function(err){
    if(err){
      return (callback||NOOP)(err);
    }
    return _read(path, function(err, dir){
      return (callback||NOOP)(null, (dir||'undefined').trim());
    });
  };
  return _read(path, function(err, dir){
    if(err){
      return self.export(function(err){
        if(err){
          return callback(err);
        }
        return _write(path, mode, checkErrorSendMode);
      });
    }
    if(dir.indexOf(mode)===-1){
      return _write(path, mode, checkErrorSendMode);
    }
    return checkErrorSendMode();
  });
};

Pin.prototype.mode = function(newMode, callback){
  var self = this;
  if(typeof(newMode)==='function' || typeof(newMode) === 'undefined'){
    return self.getMode(newMode||callback);
  }
  return self.setMode(newMode, callback);
};

Pin.prototype.get = function(callback){
  var self = this;
  var path = self._gpioPath + '/value';
  return _read(path, callback);
};

Pin.prototype.set = function(value, callback){
  var self = this;
  var path = self._gpioPath + '/value';
  return _write(path, value, callback);
};

Pin.prototype.val = function(value, callback){
  var self = this;
  if(typeof(value)==='function' || typeof(value) === 'undefined'){
    return self.get(value||callback);
  }
  return self.set(value, callback);
};

module.exports = Pin;
