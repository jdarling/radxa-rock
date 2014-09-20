var MindMap = require('../../charts/mindmap.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var MindMapController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= MindMap();
  applyChartConfiguration('mm', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
  self.dataAttributePrefix = 'mm';
};

MindMapController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('MindMap', MindMapController);
