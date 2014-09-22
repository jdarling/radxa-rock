var pins = require('../../lib/pins');
var keys = Object.keys(pins);
var reIsNumeric = /^\d+$/;

var reSplitKey = /^J(\d+)_P(\d+)$/;
var sortKeys = function(a, b){
  var key1 = pins[a].keys[0];
  var key2 = pins[b].keys[0];
  var m1 = key1.match(reSplitKey);
  var m2 = key2.match(reSplitKey);
  if(m1[1]===m2[1]){
    return parseInt(m1[2])-parseInt(m2[2]);
  }
  return parseInt(m1[1])-parseInt(m2[1]);
};
keys = keys.sort(sortKeys);

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
  var newVal = parseInt(req.params.value)||0;
  var pin = pins[pinNumber];
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
    pin.set(newVal);
    val.value = pin.get();
    reply(val);
  }
  return reply({
    root: 'error',
    error: 'Pin '+pinNumber+' unknown'
  });
};

var setPinMode = function(req, reply){
  var pinNumber = req.params.id;
  var mode = req.params.mode;
  var pin = pins[pinNumber];
  if(pin){
    pin.mode(mode, function(err, mode){
      if(err){
        return reply(err);
      }
      var val = {
        pin: pin.pin,
        names: pin.keys,
        mode: pin.mode(mode),
        value: pin.get()
      };
      return reply(val);
    });
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
    },
    {
      method: 'POST',
      path: config.route+(config.path||'pin')+'/{id}/mode/{mode}',
      handler: setPinMode
    }
  ]);
  next();
};
