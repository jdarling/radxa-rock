var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');

var PinController = function(container, data){
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
        return setTimeout(checkValue, 100);
      });
    }
    return setTimeout(checkValue, 100);
  };
  container.addEventListener('change', function(e){
    if(e.target && e.target.nodeName === 'SELECT'){
      var target = (e.target.dataset.api||'').replace('{value}', support.val(e.target).toLowerCase());
      Loader.post(target, function(err, data){
        if(err){
          return alert(err);
        }
        return setTimeout(function(){
          return refresh(data);
        }, 100);
      });
    }
  });
  refresh(data[idx]);
  checkValue();
};

controllers.register('PinController', PinController);
