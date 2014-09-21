var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');

var PinController = function(container, data){
  var idx = container.dataset.index;
  var pin = data[idx];
  var template = Handlebars.compile(container.innerHTML);
  var refresh = function(data){
    container.innerHTML = template(data, {helpers: handlebarsHelpers});
  };
  container.addEventListener('change', function(e){
    if(e.target && e.target.nodeName === 'SELECT'){
      var target = (e.target.dataset.api||'').replace('{value}', support.val(e.target).toLowerCase());
      Loader.post(target, function(err, data){
        if(err){
          return alert(err);
        }
        return refresh(data);
      });
    }
  });
  refresh(pin);
};

controllers.register('PinController', PinController);
