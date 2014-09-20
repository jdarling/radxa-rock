module.exports = function Bar() {
  var
      margin = {top: 30, right: 10, bottom: 50, left: 50},
      width = -1,
      height = 420,
      xRoundBands = 0.2,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.scale.ordinal(),
      yScale = d3.scale.linear(),
      yAxis = d3.svg.axis().scale(yScale).orient("left"),
      xAxis = d3.svg.axis().scale(xScale),
      xAxisBottom = d3.svg.axis().scale(xScale),
      style = false,
      onUpdate = false,
      duration = 500,
      getColor = false,
      container,
      enterBar = function(bar){
        bar = bar.append("rect")
          .attr("class", function(d, i) { return yValue(d) < 0 ? "negative" : "positive"; })
          ;
        if(getColor){
          bar.style('fill', getColor);
        }
      },
      updateBar = function(bar){
        bar.select('rect')
          .attr("class", function(d) { return yValue(d) < 0 ? "negative" : "positive"; })
          .attr("x", function(d) { return X(d); })
          .attr("y", function(d) { return yValue(d) < 0 ? Y0() : Y(d); })
          .attr("width", xScale.rangeBand())
          .attr("height", function(d, i) { return Math.abs( Y(d) - Y0() ); })
          ;
      },
      exitBar = function(bar){
      }
      ;

  function chart(selection) {
    selection.each(function(data) {
      var w = width===-1?this.offsetWidth:width;
      // Update the x-scale.
      xScale
          .domain(data.map(xValue))
          .rangeRoundBands([0, w - margin.left - margin.right], xRoundBands);

      var ys = d3.extent(data.map(yValue));
      if(ys[0]>0){
        ys[0] = 0;
      }
      // Update the y-scale.
      yScale
          .domain(ys)
          .range([height - margin.top - margin.bottom, 0])
          .nice();

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "bars");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "x axis bottom");
      gEnter.append("g").attr("class", "x axis zero");

      // Update the outer dimensions.
      svg .attr("width", w)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     // Update the bars.
      var bars = svg.select(".bars");//.selectAll(".bar");//.data(data);
      var bar = bars.selectAll('g.bar').data(data);

      var barEnter = bar.enter()
        .append("g")
        .attr('class', 'bar')
        ;
      enterBar(barEnter);
      updateBar(bar.transition().duration(duration));
      var barExit = bar.exit()
        .remove()
        ;
      exitBar(barExit);

    // x axis at the bottom of the chart
    g.select(".x.axis.bottom")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(xAxisBottom.orient("bottom"));
    // zero line
     g.select(".x.axis.zero")
        .attr("transform", "translate(0," + Y0() + ")")
        .call(xAxis.tickFormat("").tickSize(0));

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
  }


// The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  function Y0() {
    return yScale(0);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.xRoundBands = function(_) {
    if (!arguments.length) return xRoundBands;
    xRoundBands = _;
    return chart;
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
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.barEnter = function(_){
    if (!arguments.length) return enterBar;
    enterBar = _;
    return chart;
  };

  chart.barUpdate = function(_){
    if (!arguments.length) return updateBar;
    updateBar = _;
    return chart;
  };

  chart.barExit = function(_){
    if (!arguments.length) return exitBar;
    exitBar = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
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

  chart.update = function() {
    container.transition().duration(duration).call(chart);
  };

  return chart;
};
