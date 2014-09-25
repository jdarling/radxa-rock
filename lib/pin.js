var util = require('util');
var CONST = require('./gpio_defines');
var GPIO_PATH = CONST.GPIO_PATH;
var NOOP = function(){};
var utils = require('./utils');
var _export = utils.export;
var _unexport = utils.unexport;
var _read = utils.read;
var _write = utils.write;
var isNumeric = utils.isNumeric;
var EventEmitter = require('events').EventEmitter;

var pinEmitter = new EventEmitter();

var checkChanged = (function(){
  var values = {};
  return function(pinNumber, callback){
    var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
    var now = (new Date()).getTime();
    var old = values[pinNumber]|| (values[pinNumber] = {
      value: null,
      lastChecked: false
    });
    try{
      if(!old.lastChecked || (old.lastChecked-now > CONST.PIN_SCAN_TIME||10)){
        return _read(path, function(err, value){
          if(err){
            return callback(err);
          }
          if(value!==old.value){
            pinEmitter.emit('pin'+pinNumber+':change', value, old.value);
            pinEmitter.emit('pin:change', pinNumber, value, old.value);
            old.value = value;
          }
          old.lastChecked = (new Date()).getTime();
          callback();
        });
      }
      return callback();
    }catch(e){
      old.lastChecked = (new Date()).getTime();
      callback(e);
    }
  };
})();

var haltScanner = (function(){
  var min = Number.MAX_VALUE, max=0, curr = 0;
  var keys = Object.keys(CONST);
  var reIsPort = /^J\d{1,2}_P\d{1,2}$/;
  var halt = false;

  keys.forEach(function(key){
    val = CONST[key];
    if(isNumeric(val) && val > 0 && key.match(reIsPort)){
      if(val < min){
        min = val;
      }
      if(val > max){
        max = val;
      }
    }
  });

  curr = min;
  var scanner = function _scanner(){
    checkChanged(curr, function(){
      curr++;
      if(curr>max){
        curr = min;
      }
      if(!halt){
        process.nextTick(scanner);
      }
    });
  };
  scanner();
  return function(){
    halt = true;
  };
})();

var Pin = function(opts){
  var self = this;
  var options = isNumeric(opts)?{pin: opts}:opts;
  var pinNumber = options.pin;
  if(!pinNumber){
    throw new Error('No pin number supplied!');
  }
  self._pin = pinNumber;
  self._gpioPath = GPIO_PATH + 'gpio'+ pinNumber;
  if(options.mode){
    self.setMode(options.mode);
  }
};

Pin.prototype.on = function(event, callback){
  var self = this;
  pinEmitter.on('pin'+self.pin+':'+event, callback);
};

Pin.prototype.once = function(event, callback){
  var self = this;
  pinEmitter.once('pin'+self.pin+':'+event, callback);
};

Pin.prototype.removeListener = function(event, callback){
  var self = this;
  pinEmitter.removeListener('pin'+self.pin+':'+event, callback);
};

Pin.prototype.emit = function(event, arg){
  var self = this, args = Array.prototype.slice.call(arguments);
  args.unshift('pin'+self.pin+':'+event);
  EventEmitter.prototype.emit.apply(pinEmitter, args);
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

Pin.prototype.setMode = function(direction, callback){
  var self = this;
  var mode = direction === 'in' || direction === 'input' ? 'in':'out';
  var path = self._gpioPath + '/direction';
  var checkErrorSendMode = function(err){
    if(err){
      return (callback||NOOP)(err);
    }
    return _read(path, function(err, dir){
      return (callback||function(err, val){
        return val;
      })(null, (dir||'undefined').trim());
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
  return _write(path, value, function(err){
    if(err){
      self.emit('error', err);
      return (callback||NOOP)(err);
    }
    return (callback||NOOP)(null, value);
  });
};

Pin.prototype.val = function(value, callback){
  var self = this;
  if(typeof(value)==='function' || typeof(value) === 'undefined'){
    return self.get(value||callback);
  }
  return self.set(value, callback);
};

module.exports = Pin;
module.exports.emitter = pinEmitter;
module.exports.haltScanner = haltScanner;
