module.exports = function Line() {
  var
    margin = {top: 30, right: 10, bottom: 50, left: 50},
    width = -1,
    height = 420,
    duration = 500,
    xValue = function(d) { return d[0]; },
    yValue = function(d) { return d[1]; },
    xScale = d3.scale.linear(),
    yScale = d3.scale.linear(),
    yAxis = d3.svg.axis().scale(yScale).orient("left"),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
    getText = function(d){ return d.text||''; },
    getValue = function(d){
      return yValue(d);
    },
    line = d3.svg.line()
      .x(function(d,i) {
        return xScale(i);
      })
      .y(function(d){
        return yScale(yValue(d));
      }),
    enterSample = function(node){
      var sample = node
        .append('path').classed('line', true)
              .style({
                  fill: 'none',
                  stroke: getColor||'black'
              })
              .attr('d', d3.svg.line().x(function(d, i){return xScale(i)}).y(height))
              ;
    },
    updateSample = function(node){
      node.select('.line').attr('d', line);

      var samples = node
        .selectAll('.point')
        .data(function(d){
          return d;
        });
      var samplesEnter = samples.enter()
        .append('circle').classed('point', true)
        .style({
          fill: getColor||'black',
          stroke: getColor||'black'
        })
        .attr('transform', function(d, i) { return 'translate(' + xScale(i) + ', ' +  (height+margin.top) + ')'; })
        .attr('r', 4)
        ;

      var points = node.selectAll('.point')
        .attr('transform', function(d, i) { return 'translate(' + xScale(i) + ', ' +  yScale(yValue(d)) + ')'; })
        ;
    },
    exitSample = function(node){
    },
    xRoundBands = 0.2,
    style = false,
    onUpdate = false,
    getColor = false
    ;

  function chart(selection) {
    selection.each(function(data) {
      var wid = width===-1?this.offsetWidth:width;
      if(!(data[0] instanceof Array)){
        data = [data];
      }
      // Update the x-scale.
      xScale
          .domain([0, d3.max(data, function(series) { return series.length-1; })])
          .range([0, wid - margin.left - margin.right])
          ;

      //var ys = d3.extent(data.map(yValue));
      var ys = [
          d3.min(data, function(s) { return d3.min(s, yValue) }),
          d3.max(data, function(s) { return d3.max(s, yValue) })
        ];
      // Update the y-scale.
      yScale
          .domain(ys)
          .range([height - margin.top - margin.bottom, 0])
          .nice();

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "series");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "x axis bottom");
      gEnter.append("g").attr("class", "x axis zero");

      // Update the outer dimensions.
      svg .attr("width", wid)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var lineGroup = svg.select(".series").selectAll("g.line")
        .data(data);
      var sampleEnter = lineGroup.enter().append('g').classed('line', true);
      enterSample(sampleEnter);
      updateSample(lineGroup);
      /*
      updateSample(lineGroup.transition()
            .duration(duration));
      */
      exitSample(lineGroup.exit().remove());

      // x axis at the bottom of the chart
      g.select(".x.axis.bottom")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(xAxis);

      // Update the y-axis.
      g.select(".y.axis")
        .call(yAxis);
      g.selectAll(".axis line")
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
        ;
        g.selectAll('.axis path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
        ;
      if(style){
        var key;
        for(key in style){
          svg.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(svg);
      }
    });
  };

  function X(d) {
    return xScale(xValue(d));
  }

  function Y(d) {
    return yScale(yValue(d));
  }

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
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xScale = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };

  chart.yScale = function(_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return getText;
    getText = _;
    return chart;
  };

  chart.value= function(_) {
    if (!arguments.length) return getValue;
    getValue = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
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
