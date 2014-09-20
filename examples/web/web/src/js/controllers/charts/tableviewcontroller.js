var Table = require('../../charts/table.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var TableViewController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Table();
  applyChartConfiguration('table', container, self.chart, ['cols', 'width', 'height', 'identity', 'duration', 'style']);
  self.chart
    .updated(function(vis){
      vis.attr('class', 'ink-table');
    })
    ;
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
  self.dataAttributePrefix = 'table';
};

TableViewController.prototype.update = function(data){
  var self = this;
  var isAllArray = function(isArray, toCheck){
    return isArray && (toCheck instanceof Array);
  };
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  if(data[0] instanceof Array && data.reduce(isAllArray,  true)){
    tmp = [];
    while(data.length){
      tmp = tmp.concat(data.shift());
    }
    data = tmp;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('TableView', TableViewController);
