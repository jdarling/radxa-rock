var fs = require('fs');
var CONST = require('./gpio_defines');
var Pin = require('./pin');
var GPIO_PATH = CONST.GPIO_PATH;
var NOOP = function(){};
var utils = require('./utils');
var _export = utils.export;
var _unexport = utils.unexport;
var _read = utils.read;
var _write = utils.write;

var Rock = function(options, callback){
  var self = this;
  if(typeof(options)==='function'){
    return options(null, self);
  }
  var pins = (options||{}).pins||[];
  var toSet = pins.length;
  var errors = [];
  var done = function(){
    (callback||NOOP)(errors.length?errors:null, self);
  };
  var next = function(err){
    toSet--;
    if(err){
      errors.push(err);
    }
    if(toSet<=0){
      return done();
    }
  };
  if(pins.length===0){
    return done();
  }
  pins.forEach(function(info){
    self.setPinMode(info.pinNumber||info.pin, info.mode, next);
  });
};

Rock.prototype.pin = function(pinNumber){
  return new Pin(pinNumber);
};

Rock.prototype.export = function(pinNumber, callback){
  _export(pinNumber, callback);
};

Rock.prototype.unexport = function(pinNumber, callback){
  _unexport(pinNumber, callback);
};

Rock.prototype.getPinMode = function(pinNumber, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/direction';
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

Rock.prototype.setPinMode = function(pinNumber, direction, callback){
  var self = this;
  var mode = direction === 'in' || direction === 'input' ? 'in':'out';
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/direction';
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
      return self.export(pinNumber, function(err){
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

Rock.prototype.pinMode = function(pinNumber, mode, callback){
  var self = this;
  if(typeof(mode)==='function' || typeof(mode) === 'undefined'){
    return self.getPinMode(pinNumber, mode||callback);
  }
  return self.setPinMode(pinNumber, mode, callback);
};

Rock.prototype.get = function(pinNumber, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
  return _read(path, callback);
};

Rock.prototype.set = function(pinNumber, value, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
  return _write(path, value, callback);
};

module.exports = Rock;
