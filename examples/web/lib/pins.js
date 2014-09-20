var CONST = require('../../index').CONST;
var reIsPort = /^J\d{1,2}_P\d{1,2}$/;
var keys = Object.keys(CONST);
var pins = {};
var pinNumber = 0;

keys.forEach(function(key){
  if(key.match(reIsPort)){
    pinNumber = CONST[key];
    if(pinNumber === -1){
      return;
    }
    if(!pins[pinNumber]){
      pins[pinNumber] = {pin: pinNumber, keys: []};
    }
    pins[pinNumber].keys.push(key);
    pins[key] = pins[pinNumber];
  }
});

module.exports = pins;
