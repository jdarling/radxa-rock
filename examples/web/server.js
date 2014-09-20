var pins = require('./lib/pins');

var keys = Object.keys(pins);

var reIsNumeric = /^\d+$/;
var pin;

keys.forEach(function(key){
  if(key.match(reIsNumeric)){
    pin = pins[key];
    console.log(pin.keys[0], pin.mode());
  }
});
