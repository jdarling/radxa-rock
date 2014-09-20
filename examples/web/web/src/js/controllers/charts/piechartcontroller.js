var Pie = require('../../charts/pie.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var PieChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Pie();
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

PieChartController.prototype.update = function(data){
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

require('../../../lib/controllers').register('PieChart', PieChartController);
