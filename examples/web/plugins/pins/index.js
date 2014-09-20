var pins = require('../../lib/pins');
var keys = Object.keys(pins);
var reIsNumeric = /^\d+$/;

var pinListing = function(req, reply){
  var response = [], pin, val;
  keys.forEach(function(key){
    if(key.match(reIsNumeric)){
      pin = pins[key];
      val = {
        pin: pin.pin,
        names: pin.keys,
        mode: pin.mode()
      };
      if(val.mode === 'in' || val.mode === 'out'){
        val.value = pin.get();
      }
      response.push(val);
    }
  });
  reply(response);
};

var getPin = function(req, reply){
  var pinNumber = req.params.id;
  var pin = pins[pinNumber];
  if(pin){
    var val = {
      pin: pin.pin,
      names: pin.keys,
      mode: pin.mode()
    };
    if(val.mode === 'in' || val.mode === 'out'){
      val.value = pin.get();
    }
    reply(val);
  }
  return reply({
    root: 'error',
    error: 'Pin '+pinNumber+' unknown'
  });
};

var setPin = function(req, reply){
  var pinNumber = req.params.id;
  var val = parseInt(req.params.value)||0;
  var pin = pins[pinNumber];
console.log('set: ', pin, 'to', val);
  if(pin){
    var val = {
      pin: pin.pin,
      names: pin.keys,
      mode: pin.mode()
    };
    if(val.mode !== 'out'){
      return reply({
        root: 'error',
        error: 'Pin '+pinNumber+' is not an output'
      });
    }
    pin.set(val);
    val.value = pin.get();
    reply(val);
  }
  return reply({
    root: 'error',
    error: 'Pin '+pinNumber+' unknown'
  });
};

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  server.route([
    {
      method: 'GET',
      path: config.route+(config.path||'pins'),
      handler: pinListing
    },
    {
      method: 'GET',
      path: config.route+(config.path||'pin')+'/{id}',
      handler: getPin
    },
    {
      method: 'POST',
      path: config.route+(config.path||'pin')+'/{id}/{value}',
      handler: setPin
    }
  ]);
  next();
};
