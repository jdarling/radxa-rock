var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');
var els = support.els;
var el = support.el;

var PinFilterController = function(container, data){
  var self = this;
  var filterList = function(src){
    var re = new RegExp(src, 'gi');
    var boxes = els(container.parentNode, '[data-pins]');
    boxes.forEach(function(box){
      var pins = box.dataset.pins.split(',').map(function(s){
        return s.trim();
      }).join('\n');
      box.className = box.className.replace(/(^|\W+)hidden(\W+|$)/gi, '').trim();
      els(box, 'select').forEach(function(elem){
        if(elem.selectedIndex !== -1){
          pins += '\n'+elem.options[elem.selectedIndex].text;
        }
      });
      if(src && !pins.match(re)){
        box.className = box.className + ' hidden';
      }
    });
  };
  var clickHandler = self.clickHandler = function(e){
    if(e.target && e.target.nodeName === 'BUTTON'){
      var val = support.val(el(container, '[role="search"] input'));
      filterList(val);
      e.preventDefault();
      return false;
    }
  };
  var keyHandler = self.keyHandler = function(e){
    var code = e.key||e.keyCode;
    if(!e.target){
      return;
    }
    filterList(support.val(e.target));
    if(code === 13){
      e.preventDefault();
      return false;
    }
  };
  container.addEventListener('click', clickHandler);
  container.addEventListener('keyup', keyHandler);
};

PinFilterController.prototype.teardown = function(container){
  var self = this;
  container.removeEventListener('click', self.clickHandler);
  container.removeEventListener('keyup', self.keyHandler);
};

controllers.register('PinFilter', PinFilterController);
