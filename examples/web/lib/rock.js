var CONST = require('../../../index').CONST;
var simulationMode = (function(){
  var fs = require('fs');
  return !fs.existsSync(CONST.GPIO_PATH);
})();

if(!simulationMode){
  var Rock = require('../../../index').Rock;

  return module.exports = new Rock();
}

console.log('NOTE: '+CONST.GPIO_PATH+' is not available, running in simulation mode!');

var reIsPort = /^J\d{1,2}_P\d{1,2}$/;
var keys = Object.keys(CONST);
var Pin = require('../../../index').Pin;

var Rock = function(options, callback){
  var self = this, pinNumber;
  self._pins = {};
  keys.forEach(function(key){
    if(key.match(reIsPort)){
      pinNumber = CONST[key];
      self._pins[pinNumber] = {
        mode: 'unknown',
        exported: false,
        value: 0
      };
    }
  });
  if(typeof(options)==='function'){
    return options(null, this);
  }
  if(callback){
    return callback(null, this);
  }
};

Rock.prototype.pin = function(pinNumber){
  return new Pin(pinNumber);
};

Rock.prototype.export = function(pinNumber, callback){
  var self = this;
  self._pins[pinNumber].exported = true;
  if(callback){
    callback();
  }
};

Rock.prototype.unexport = function(pinNumber, callback){
  var self = this;
  self._pins[pinNumber].exported = false;
  if(callback){
    callback();
  }
};

Rock.prototype.getPinMode = function(pinNumber, callback){
  var self = this;
  if(callback){
    return callback(null, self._pins[pinNumber].mode||'undefined');
  }
  if(!self._pins[pinNumber]){
    return 'unavailable';
  }
  return self._pins[pinNumber].mode||'undefined';
};

Rock.prototype.setPinMode = function(pinNumber, direction, callback){
  var self = this;
  self._pins[pinNumber].mode = direction === 'in' || direction === 'input' ? 'in' : 'out';
  if(callback){
    return callback(null, self._pins[pinNumber].mode);
  }
  return self._pins[pinNumber].mode;
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
  if(callback){
    return callback(null, self._pins[pinNumber].value||0);
  }
  return self._pins[pinNumber].value||0;
};

Rock.prototype.set = function(pinNumber, value, callback){
  var self = this;
  self._pins[pinNumber].value = +(!!value);
  if(callback){
    return callback(null, self._pins[pinNumber].value||0);
  }
  return self._pins[pinNumber].value||0;
};

module.exports = new Rock();
