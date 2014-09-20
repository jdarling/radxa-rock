var Line = require('../../charts/line.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var LineChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Line();
  applyChartConfiguration('chart', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
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
};

LineChartController.prototype.update = function(data){
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

require('../../../lib/controllers').register('LineChart', LineChartController);
