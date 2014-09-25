var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');
var sockets = require('../../lib/sockets');

var PinController = function(container, data){
  var self = this;
  var findPin = function(pinNumber){
    var i=0, l=data.length;
    while(i<l){
      if(data[i].pin === pinNumber){
        return i;
      }
      i++;
    }
    return -1;
  };
  var idx = container.dataset.index||findPin(+container.dataset.pin);
  var template = Handlebars.compile(container.innerHTML);
  var oldValue, pin;
  var refresh = function(data){
    pin = data;
    oldValue = pin.value;
    container.innerHTML = template(data, {helpers: handlebarsHelpers});
  };
  var changeHandler = self.changeHandler = function(e){
    if(e.target && e.target.nodeName === 'SELECT'){
      var target = (e.target.dataset.api||'').replace('{value}', support.val(e.target).toLowerCase());
      Loader.post(target, function(err, data){
        if(err){
          return alert(err);
        }
      });
    }
  };
  var pinChanged = self.pinChanged = function(value){
    pin.value = value;
    refresh(pin);
  };
  container.addEventListener('change', changeHandler);
  refresh(data[idx]);
  sockets.on('pin'+pin.pin+':change', pinChanged);
  self.pin = pin.pin;
};

PinController.prototype.teardown = function(container){
  var self = this;
  container.removeEventListener('change', self.changeHandler);
  sockets.removeListener('pin'+self.pin+':change', self.pinChanged);
};

controllers.register('PinController', PinController);
