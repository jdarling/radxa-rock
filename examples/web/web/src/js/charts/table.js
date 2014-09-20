var Table = module.exports = function(){
  var
      width = -1,
      height = -1,
      identity = '_id',
      idx = 1,
      duration = 500,
      style = false,
      onUpdate = false,
      cols = [],
      cellEnter = function(cell, cols){
      },
      cellUpdate = function(cell, cols){
        cell
          .html(function(d){
            var data = this.parentNode.__data__;
            var key = d.value||d;
            if(typeof(key)==='function'){
              return key(data);
            }
            return data[key];
          })
          ;
      },
      cellExit = function(){
      },
      headerEnter = function(th, cols){
      },
      headerUpdate = function(th, cols){
        th
          .text(function(col){
            return col.title||col.value||col;
          })
      },
      headerExit = function(){
      }
      ;
  var chart = function(selection){
    selection.each(function(data){
      var colHeaders = cols;
      var vis = d3.select(this).select('table');
      var thead = vis.select('thead')
            tbody = vis.select('tbody');
      var i=0, l=data.length;
      for(;i<l; i++){
        data[i][identity] = data[i][identity] || idx++;
      }
      if(!vis[0][0]){
        vis = d3.select(this).append('table');
        vis
          .attr('cellspacing', 0)
          .attr('cellpadding', 0)
          ;
        thead = vis.append('thead');
        tbody = vis.append('tbody');
      }
      if(width>-1){
        vis
          .attr('width', width)
          ;
      }
      if(height>-1){
        vis
          .attr('height', height)
          ;
      }

      if(colHeaders.length===0 && data.length){
        colHeaders = Object.keys(data[0]);
      }

      var th = thead.select('tr');
      if(!th[0][0]){
        th = thead.append('tr');
      }
      var th = th
        .selectAll('th')
        .data(colHeaders)
        ;
      var thEnter = th
        .enter()
        .append('th')
        ;
      headerEnter(thEnter, colHeaders);

      headerUpdate(th, colHeaders);

      headerExit(th.exit().remove(), colHeaders);

      var rows = tbody.selectAll('tr')
        .data(data)
        ;
      rows
        .enter()
        .append('tr')
        ;

      var cells = rows.selectAll('td')
        .data(colHeaders)
          ;
      var cellsEnter = cells
          .enter()
          .append('td')
          ;
      cellEnter(cellsEnter, colHeaders);
      cellUpdate(cells, colHeaders);
      cellExit(rows.exit().remove().selectAll('td'), colHeaders);

      if(style){
        var key;
        for(key in style){
          vis.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(vis);
      }
    });
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.identity = function(_) {
    if (!arguments.length) return identity;
    identity = _;
    return chart;
  };

  chart.cols = function(_) {
    if (!arguments.length) return cols;
    cols = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

  chart.cellEnter = function(_){
    if (!arguments.length) return cellEnter;
    cellEnter = _;
    return chart;
  };

  chart.cellUpdate = function(_){
    if (!arguments.length) return cellUpdate;
    cellUpdate = _;
    return chart;
  };

  chart.cellExit = function(_){
    if (!arguments.length) return cellExit;
    cellExit = _;
    return chart;
  };

  chart.update = function() { container.transition().duration(duration).call(chart); };

  return chart;
};
