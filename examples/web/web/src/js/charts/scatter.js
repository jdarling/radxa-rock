var Scatter = module.exports = function(){
  var
      margin = {top: 20, left: 50, bottom: 20, right: 20},
      width = -1,
      height = 500,
      duration = 500,
      showXAxis = true,
      showYAxis = true,
      identity = '_id',
      idx = 1,
      style = false,
      onUpdate = false,
      getColor = false,
      getX = function x(d){
        return d.x;
      },
      getY = function y(d){
        return d.y;
      },
      getR = function(d){
        return 8;
      },
      getScaleX = function(data, w){
        var min = d3.min(data, getX), max = d3.max(data, getX);
        var r = ((max - min) * 0.1) || 1;
        min -= r;
        max += r;
        return d3.scale.linear()
          .domain([min, max])
          .range([0, w])
          ;
      },
      getScaleY = function(data, h){
        var min = d3.min(data, getY), max = d3.max(data, getY);
        var r = ((max - min) * 0.1) || 1;
        min -= r;
        max += r;
        return d3.scale.linear()
          .domain([max, min])
          .range([0,h])
          ;
      },
      getColor = function(d){
        return 'black';
      },
      getText = function(d){ return d.text||''; },
      enterNode = function(node){
        var circle = node.append('svg:circle')
            .attr('r', 1e-6);

        if(getColor){
          circle.style('fill', getColor);
        }

        node.append('svg:text')
            .attr('text-anchor', 'middle')
            .attr('dy', function(d){return -getR(d)-3})
            .text(getText)
            .style('fill-opacity', 1);
      },
      updateNode = function(node){
        node.select('text')
          .text(getText);

        node.select('circle')
            .attr('r', getR);
      },
      exitNode = function(node){
        node.select('circle')
            .attr('r', 1e-6);

        node.select('text')
            .style('fill-opacity', 1e-6);
      }
  ;

  var chart = function(selection){

    selection.each(function(data){
      var wid = width===-1?this.offsetWidth:width;
      var w = wid - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;
      var vis = d3.select(this).select('svg');
      var x = getScaleX(data, w);
      var y = getScaleY(data, h);

      if(showXAxis){
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          ;
      }
      if(showYAxis){
        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          ;
      }

      if(!vis[0][0]){
        vis = d3.select(this).append('svg');
      }
      vis
        .attr('width', wid)
        .attr('height', height)
        ;

      var node = vis.selectAll('g.node')
          .data(data, function(d) { return d[identity] || (d[identity] = ++idx); })
          ;
      var nodeEnter = node.enter().append('svg:g')
          .attr('class', 'node')
          .attr('transform', function(d, i) {
            return 'translate(' + (x(getX(d, i)) + margin.left) + ',' +  (margin.top+h)  + ')';
          })
          ;
      enterNode(nodeEnter);

      var nodeUpdate = node.transition()
          .duration(duration)
          .attr('transform', function(d, i) { return 'translate(' + (x(getX(d, i)) + margin.left) + ', ' +  (y(getY(d, i)) + margin.top) + ')'; })
          ;

      updateNode(nodeUpdate);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr('transform', function(d, i) { return 'translate(' + (x(getX(d, i)) + margin.left) + ', ' +  (margin.top+h) + ')'; })
          .remove()
          ;

      exitNode(nodeExit);

      if(showXAxis){
        var xA = vis.select('g.xAxis');
        if(!xA[0][0]){
          xA = vis.append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', 'translate(' + margin.left + ',' + (h+margin.top) + ')')
            .call(xAxis)
            ;
        }else{
          xA.transition()
            .duration(duration)
            .call(xAxis)
            ;
        }
        xA.selectAll('line')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
        xA.selectAll('path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
      }

      if(showYAxis){
        var yA = vis.select('g.yAxis');
        if(!yA[0][0]){
          yA = vis.append('g')
            .attr('class', 'axis yAxis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(yAxis)
            ;
        }else{
          yA.transition()
            .duration(duration)
            .call(yAxis)
            ;
        }
        yA.selectAll('line')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
        yA.selectAll('path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
      }

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

  chart.x = function(_) {
    if (!arguments.length) return getX;
    getX = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return getY;
    getY = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return getText;
    getText = _;
    return chart;
  };

  chart.size = function(_) {
    if (!arguments.length) return getR;
    if(typeof(_)==='function'){
      getR = _;
    }else{
      getR = function(){
        return _;
      }
    }
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.identity = function(_) {
    if (!arguments.length) return identity;
    identity = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.xAxis = function(_){
    if (!arguments.length) return showXAxis;
    showXAxis = !!_;
    return chart;
  };

  chart.yAxis = function(_){
    if (!arguments.length) return showYAxis;
    showYAxis = !!_;
    return chart;
  };

  chart.scaleX = function(_) {
    if (!arguments.length) return getScaleX;
    getScaleX = _;
    return chart;
  };

  chart.scaleY = function(_) {
    if (!arguments.length) return getScaleY;
    getScaleY = _;
    return chart;
  };

  chart.nodeEnter = function(_){
    if (!arguments.length) return enterNode;
    enterNode = _;
    return chart;
  };

  chart.nodeUpdate = function(_){
    if (!arguments.length) return updateNode;
    updateNode = _;
    return chart;
  };

  chart.nodeExit = function(_){
    if (!arguments.length) return exitNode;
    exitNode = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

return chart;
};
