var Scatter = require('../../charts/scatter.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var ScatterChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Scatter();
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

ScatterChartController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  if(data[0] instanceof Array){
    var tmp = [];
    var i, l = data.length, j, k, v;
    for(i=0; i<l; i++){
      k = data[i].length;
      for(j=0; j<k; j++){
        v = data[i][j];
        v.x = i;
        v.y = v.value;
        tmp.push(v);
      }
    }
    data = tmp;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('ScatterChart', ScatterChartController);
