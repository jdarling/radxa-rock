var CONST = require('../../index').CONST;
var reIsPort = /^J\d{1,2}_P\d{1,2}$/;
var keys = Object.keys(CONST);
var pins = {};
var pinNumber = 0;
var rock = require('./rock');

var getStatus = function(pinNumber){
  return function(callback){
    return rock.get(pinNumber, callback);
  };
};

var setStatus = function(pinNumber){
  return function(value, callback){
    return rock.set(pinNumber, value, callback);
  };
};

var mode = function(pinNumber){
  return function(mode, callback){
    return rock.pinMode(pinNumber, mode, callback);
  };
};

keys.forEach(function(key){
  if(key.match(reIsPort)){
    pinNumber = CONST[key];
    if(pinNumber === -1){
      return;
    }
    if(!pins[pinNumber]){
      pins[pinNumber] = {
          pin: pinNumber,
          keys: [],
          get: getStatus(pinNumber),
          set: setStatus(pinNumber),
          mode: mode(pinNumber)
        };
    }
    pins[pinNumber].keys.push(key);
    pins[key] = pins[pinNumber];
  }
});

module.exports = pins;
