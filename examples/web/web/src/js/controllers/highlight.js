var controllers = require('../../lib/controllers.js');
var support = require('../../lib/support');
var el = support.el;
var els = support.els;

var HighlightController = function(container, data){
  var self = this;
  var overHandler = self.overHandler = function(e){
    if(e.target && e.target.dataset.highlight){
      var elems = els(container, e.target.dataset.highlight);
      elems.forEach(function(elem){
        elem.className = (elem.className+' highlight').trim();
      });
    }
  };
  var outHandler = self.overHandler = function(e){
    if(e.target && e.target.dataset.highlight){
      var elems = els(container, '.highlight');
      elems.forEach(function(elem){
        elem.className = (elem.className.replace(/(\s|^)highlight(\s|$)/, ' ')).trim();
      });
    }
  };
  container.addEventListener('mouseover', overHandler);
  container.addEventListener('mouseout', outHandler);
};

HighlightController.prototype.teardown = function(container){
  var self = this;
  container.addEventListener('mouseover', self.overHandler);
  container.addEventListener('mouseout', self.outHandler);
};

controllers.register('Highlight', HighlightController);
