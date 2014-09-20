var Pie = module.exports = function(){
  var
      margin = {top: 20, left: 50, bottom: 20, right: 20},
      width = -1,
      height = 500,
      duration = 500,
      identity = '_id',
      idx = 1,
      ir = 0,
      style = false,
      onUpdate = false,
      container,
      getValue = function x(d){
        return +d.value;
      },
      colorRange = false,
      getColor = function(d){
        return colorRange(getValue(d));
      },
      getText = function(d){
        return d.text||'';
      },
      getIdentity = function(d){
        return d.data[identity] || (d.data[identity] = ++idx);
      },
      enterSlice = function(node, arc){
        node.append('path')
          .style('fill', function(d){
            return getColor(d.data);
          })
          ;
        node.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return getText(d.data); });
      },
      updateSlice = function(node, arc){
        node.select('path')
          .style('fill', function(d){
            return getColor(d.data);
          })
          .attrTween('d', function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return arc(interpolate(t));
            };
          });
        node.select('text')
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .text(function(d) { return getText(d.data); });
      },
      exitSlice = function(node, arc){
      }
  ;

  var chart = function(selection){
    container = selection;
    selection.each(function(data){
      var wid = width===-1?this.offsetWidth:width;
      var w = wid - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;
      var r = (w>h)?Math.floor(h/2):Math.floor(w/2);
      var vis = d3.select(this).select('svg');
      var min = d3.min(data, getValue), max = d3.max(data, getValue);
      var i=0, l=data.length;
      for(;i<l; i++){
        data[i][identity] = data[i][identity] || idx++;
      }
      colorRange = d3.scale.linear().domain([min, max]).range(["#ddd", "#333"]);

      if(!vis[0][0]){
        vis = d3.select(this).append('svg');
      }
      vis
        .attr('width', wid)
        .attr('height', height)
        ;

      var arc = d3.svg.arc()
          .outerRadius(r)
          .innerRadius(ir);

      var pie = d3.layout.pie()
          .value(getValue);

      var main = vis.select('g');
      var slices = main.select('.slices');
      if(!main[0][0]){
        main = vis.append('g');
        slices = main.append('g').attr('class', 'slices');
      }
      main
        .attr('transform', 'translate('+(margin.left+(w/2))+', '+(margin.top+(h/2))+')')
        ;

      var slice = slices.selectAll('g.slice')
        .data(pie(data, getIdentity));
        ;

      var sliceEnter = slice.enter()
        .append('g')
        .attr('class', 'slice')
        ;
      enterSlice(sliceEnter, arc);

      updateSlice(slice.transition().duration(duration), arc);

      var sliceExit = slice.exit()
        .remove()
        ;

      exitSlice(sliceExit);

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

  chart.value = function(_) {
    if (!arguments.length) return getValue;
    getValue = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return getText;
    getText = _;
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

  chart.innerRadius = function(_){
    if (!arguments.length) return ir;
    ir = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
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

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.refresh = function() {
  };
  chart.update = function() {
    container.transition().duration(duration).call(chart);
  };

  return chart;
};
