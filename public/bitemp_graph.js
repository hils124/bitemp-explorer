var barChart = function() {

  // default values for configurable input parameters
  var width = 600;
  var height = 300;
  var margin = {
    top: 10,
    right: 0,
    bottom: 40,
    left: 80
  };
  var xAxisLabel = 'System Time';
  var yAxisLabel = 'Valid Time';

  var color = d3.scale.category20c();

  var xScale, xAxis, xAxisCssClass;
  var yScale, yAxis, g;
  var axisLabelMargin;

  function onMouseMove(d){
    if (d != undefined) {
    var coordinates = [0, 0];
    d3.select("#tooltip")
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
      .select("#value")
      //.text(JSON.stringify(d.content,undefined, 2));
      .text(d.content.data)

    //Show the tooltip
    d3.select("#tooltip").classed("hidden", false);

    d3.select(this)
    .transition()
    .duration(500)
    .attr("opacity", "0.7");
    }
  }

  function onMouseOut(d){
    
    d3.select(this)
    .transition()
    .duration(250)
    .attr("opacity", "1.0");
    d3.select("#tooltip").classed("hidden", true);
  }

  var chart = function(container) {

    setDimensions();
    setupXAxis();
    setupYAxis();
    setupBarChartLayout();
    addBackground();
    addXAxisLabel();
    addYAxisLabel();
    addBarChartData();

    function setDimensions() {

      axisLabelMargin = 10;

    }

    function setupXAxis() {

      var mindate = 
      moment.min(data.map(function(d){
        return moment(d.content.sysStart);
      })).toDate();
      var maxdate = new Date();
      
      console.log("xmin="+mindate," xmax="+maxdate);

      xScale = d3.time.scale()
      .domain([mindate, maxdate])
      .range([axisLabelMargin,width-margin.left-margin.right-axisLabelMargin]);

      if (data.length > 12 && width < 500) {
        xAxisCssClass = 'axis-font-small';
      } else {
        xAxisCssClass = '';
      }

      xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(5)
      .innerTickSize(-width + axisLabelMargin + margin.left + margin.right)
      .outerTickSize(0)
      .orient('bottom')
      .tickFormat(d3.time.format("%Y-%m-%d"));
    }

    function setupYAxis() {

      var mindate = 
      moment.min(data.map(function(d){
        return moment(d.content.valStart);
      })).toDate();

      var maxdate = 
      moment.max(data.map(function(d){
        return moment(d.content.valEnd);
      })).toDate();
      
      console.log("ymin="+mindate," ymax="+maxdate);

      yScale = d3.time.scale()
      .domain([mindate, maxdate])
      .range([height - axisLabelMargin - margin.top - margin.bottom, axisLabelMargin]);

      if (data.length > 12 && width < 500) {
        yAxisCssClass = 'axis-font-small';
      } else {
        yAxisCssClass = '';
      }

      yAxis = d3.svg.axis()
      .scale(yScale)
      .ticks(15)
      .innerTickSize(-width + axisLabelMargin + margin.left + margin.right)
      .outerTickSize(0)
      .orient('left')
      .tickFormat(d3.time.format("%Y-%m-%d"));

    }

    function setupBarChartLayout() {

      g = container.append('svg')
      .attr('class', 'svg-chart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    }

    function addXAxisLabel() {

      g.append('g')
      .attr('class', 'xaxis ' + xAxisCssClass)
      .attr('transform', 'translate(' + axisLabelMargin + ',' +
        (height - axisLabelMargin - margin.top - margin.bottom) + ')')
      .call(xAxis)
      .append('text')
      .attr('class', 'axis-label')
      .attr('y', margin.left)
    }

    function addYAxisLabel() {

      g.append('g')
      .attr('class', 'yaxis ')
      .attr('transform', 'translate(' + axisLabelMargin + ', 0)')
      .call(yAxis)
      .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -(height - margin.top - margin.bottom - axisLabelMargin) / 2)
      .style('text-anchor', 'middle')
      .text(yAxisLabel);

    }

    function addBackground() {

      g.append('rect')
      .attr('class', 'background')
      .attr('x', axisLabelMargin)
      .attr('y', -axisLabelMargin)
      .attr('width', width - axisLabelMargin - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom);

    }

    var bar;

    function addBarChartData() {
      var c=0;
      split = g.selectAll('.split')
      .data(data)
      .enter()
      .append('g')
      .attr('class','split');

      r = split
      .append('rect')
      .attr('class', 'split')
      .attr('stroke','black')
      .attr('stroke-width','2')
      .attr('fill',function(d) {
        var colorNum = Math.floor(c%20); c++;
        return color(colorNum);
      })
      .attr('x', function(d) {
        var barx = xScale(moment(d.content.sysStart).toDate());
        return barx;
      })
      .attr('y', function(d) {
        var bary = yScale(moment(d.content.valEnd).toDate());
        return bary;
      })
      .attr('height', 0)
      .attr('width', 0)
      .on("mousemove",onMouseMove)
      .on("mouseout",onMouseOut)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1)
      .attr('height', function(d) {
        var bValStart = yScale(moment(d.content.valStart).toDate());
        var bValEnd = yScale(moment(d.content.valEnd).toDate());
        var h=-bValEnd+bValStart;
        return h;
      })
      .attr('width', function(d) {
        var bSysStart = xScale(moment(d.content.sysStart).toDate());
        var bSysEnd = xScale(moment(d.content.sysEnd).toDate());
        if (bSysEnd>width) bSysEnd=width-axisLabelMargin;
        var w=bSysEnd-bSysStart;
        return w;
      });


      split.append("text")
      .attr('class','tooltip-txt')
      .style("text-anchor", "middle")
      .attr('x', function(d) {
        var barx1 = xScale(moment(d.content.sysStart).toDate());
        var barx2 = xScale(moment(d.content.sysEnd).toDate());
        return (barx1+barx2)/2;
      })
      .attr('y', function(d) {
        var bary1 = yScale(moment(d.content.valStart).toDate());
        var bary2 = yScale(moment(d.content.valEnd).toDate());
        return (bary1+bary2)/2;;
      })
      .text(function(d) { return d.content.data;});

    };
  };

  d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

  chart.updateBarChartData = function (newdata) {
    var c=0;

    var vmindate = 
    moment.min(newdata.map(function(d){
      return moment(d.content.valStart);
    })).toDate();

    var vmaxdate = 
    moment.max(newdata.map(function(d){
      return moment(d.content.valEnd);
    })).toDate();

    console.log("ymin="+vmindate," ymax="+vmaxdate);
    yScale.domain([vmindate, vmaxdate]);

    yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(15)
    .innerTickSize(-width + axisLabelMargin + margin.left + margin.right)
    .outerTickSize(0)
    .orient('left')
    .tickFormat(d3.time.format("%Y-%m-%d"));

    g.selectAll('.yaxis').remove();
    g.append('g')
    .attr('class', 'yaxis ')
    .attr('transform', 'translate(' + axisLabelMargin + ', 0)')
    .call(yAxis)

    g.selectAll('.split').data(newdata).exit().remove();

    transition = g.selectAll('.split')
    .data(newdata)
    .transition()
    .duration(800)
    .attr('x', function(d) {
      var barx = xScale(moment(d.content.sysStart).toDate());
      return barx;
    })
    .attr('y', function(d) {
      var bary = yScale(moment(d.content.valEnd).toDate());
      return bary;
    })
    .attr('height', function(d) {
      var bValStart = yScale(moment(d.content.valStart).toDate());
      var bValEnd = yScale(moment(d.content.valEnd).toDate());
      var h=-bValEnd+bValStart;
      return h;
    })
    .attr('width', function(d) {
      var bSysStart = xScale(moment(d.content.sysStart).toDate());
      var bSysEnd = xScale(moment(d.content.sysEnd).toDate());
      if (bSysEnd>width) bSysEnd=width-axisLabelMargin;
      var w=bSysEnd-bSysStart;
      return w;
    });

    var cnt = g.selectAll('.split').size();
    enter = g.selectAll('.split')
    .data(newdata)
    .enter();

    enter.append('rect')
    .attr('class', 'split')
    .attr('stroke','black')
    .attr('stroke-width','2')
    .attr('fill',function(d) {
      var colorNum = Math.floor((c+cnt)%20)+1; 
      c++;
      return color(colorNum);
    })
    .attr('x', function(d) {
      var barx = xScale(moment(d.content.sysStart).toDate());
      return barx;
    })
    .attr('y', function(d) {
      var bary = yScale(moment(d.content.valEnd).toDate());
      return bary;
    })
    .attr('height', function(d) {
      var bValStart = yScale(moment(d.content.valStart).toDate());
      var bValEnd = yScale(moment(d.content.valEnd).toDate());
      var h=-bValEnd+bValStart;
      return h;
    })
    .attr('width', function(d) {
      var bSysStart = xScale(moment(d.content.sysStart).toDate());
      var bSysEnd = xScale(moment(d.content.sysEnd).toDate());
      if (bSysEnd>width) bSysEnd=width-axisLabelMargin;
      var w=bSysEnd-bSysStart;
      return w;
    });

    g.selectAll('rect')
    .on("mousemove",onMouseMove)
    .on("mouseout", onMouseOut);
  };

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.margin = function(value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.xAxisLabel = function(value) {
    if (!arguments.length) return xAxisLabel;
    xAxisLabel = value;
    return chart;
  };

  chart.yAxisLabel = function(value) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = value;
    return chart;
  };

  return chart;
};
