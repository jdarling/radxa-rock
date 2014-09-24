var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');
var sockets = require('../../lib/sockets');

var PinController = function(container, data){
  var self = this;
  var idx = container.dataset.index;
  var template = Handlebars.compile(container.innerHTML);
  var oldValue, pin;
  var refresh = function(data){
    pin = data;
    oldValue = pin.value;
    container.innerHTML = template(data, {helpers: handlebarsHelpers});
  };
  var checkValue = function(){
    if(pin.mode==='in'){
      return Loader.get('/api/v1/pin/'+pin.pin, function(err, data){
        if(err){
          return setTimeout(checkValue, 100);
        }
        if(oldValue!==data.value){
          refresh(data);
        }
        return self.timer = setTimeout(checkValue, 100);
      });
    }
    return self.timer = setTimeout(checkValue, 100);
  };
  var changeHandler = self.changeHandler = function(e){
    if(e.target && e.target.nodeName === 'SELECT'){
      var target = (e.target.dataset.api||'').replace('{value}', support.val(e.target).toLowerCase());
      Loader.post(target, function(err, data){
        if(err){
          return alert(err);
        }
        /*
        return setTimeout(function(){
          return refresh(data);
        }, 100);
        */
      });
    }
  };
  var pinChanged = self.pinChanged = function(value){
    pin.value = value;
    refresh(pin);
  };
  container.addEventListener('change', changeHandler);
  refresh(data[idx]);
  //checkValue();
  sockets.on('pin'+pin.pin+':change', pinChanged);
};

PinController.prototype.teardown = function(container){
  var self = this;
  if(self.timer){
    clearTimeout(self.timer);
  }
  container.removeEventListener('change', self.changeHandler);
  sockets.removeListener('pin'+pin.pin+':change', self.pinChanged);
};

controllers.register('PinController', PinController);
