var pins = require('../../lib/pins');
var keys = Object.keys(pins);

var reIsNumeric = /^\d+$/;
var pin;

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  server.route({
    method: 'GET',
    path: config.route+(config.path||'pins'),
    handler: function(req, reply){
      var response = [], pin, val;
      keys.forEach(function(key){
        if(key.match(reIsNumeric)){
          pin = pins[key];
          val = {
            pin: pin.pin,
            names: pin.keys,
            mode: pin.mode()
          };
          if(val.mode === 'in'){
            val.value = val.get();
          }
          response.push(val);
        }
      });
      reply(response);
    }
  });
  next();
};
