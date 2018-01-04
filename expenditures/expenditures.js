// Expenditures bubble chart script.

// Organization and style taken from https://github.com/vlandham/bubble_chart/blob/gh-pages/src/bubble_chart.js
// which was in turn inspired by https://bost.ocks.org/mike/chart/

function bubbleChart() {

  // Constants for sizing
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;

  // maintain a ratio of 9 width to 5 height, but scale to window. Max width of 1200.
  //var width = d3.min([1200, y * 1.2, x * 0.75]),
  //    height = width * 5 / 9;
  var width = d3.min([1200, y * 1.15, x * 0.71]),
      height = width * 5 / 9;

  // scale the toolbars
  var label_size = d3.min([d3.max([12, (height / 25)]), 18]) + "px",
      entry_size = d3.min([d3.max([10, (height / 30)]), 16]) + "px",
      heading_size = d3.min([d3.max([16, (height / 13)]), 46]) + "px";
  d3.selectAll('#heading').style('font-size', heading_size);
  d3.selectAll('.toolbar_label').attr('style', "padding:0px 0px 0px 10px; font-weight: bold; font-size: " + label_size);
  d3.selectAll('.btn-group').selectAll('.btn').attr('style', "font-size: " + entry_size);
  d3.select('.typeahead').attr('style', 'font-size: ' + entry_size + ';width: ' + width * 0.6 + 'px');
  
  // make the cursor change for the toolbar buttons
  d3.selectAll('.btn-group').selectAll('.btn').on({
      "mouseover": function(d) {
        d3.select(this).style("cursor", "pointer"); 
      },
      "mouseout": function(d) {
        d3.select(this).style("cursor", "default"); 
      }
    });

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // create and activate the tooltip for displaying data on each item
  var floating_tooltip = floatingTooltip('floatingTooltip', "285px");
  d3.select('#floatingTooltip').classed('active', true);

  // Location to move bubbles towards
  var center = { x: width * 0.37, y: height * 0.50 };
  var categoryCenters = {
    "Budgetary department": { x: width * 0.27, y: height * 0.51 },
    "Non-departmental": { x: width * 0.47, y: height * 0.51 }
  };

  // X locations of the category titles.
  var categoryTitleX = {
    "Budgetary department": width * 0.17,
    "Non-departmental": width * 0.52
  };

  // Create the force layout
  var damper = 0.1;
  var force = d3.layout.force()
    .size([width, height])
    .charge(function (d) {return -Math.pow(d.radius, 2.0)/8;})
    .gravity(-0.01)
    .friction(0.9);

  // Create scale for bubbles. The value is linked to area instead of raw radius.
  // Note that the scale is based on the svg height.
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([3, height/7.5]);


  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */

  function createNodes(rawData) {

    // calculate the total budget for each year
    var total_budget17 = d3.sum(rawData, function (d) { return +d.fy17budget; });
    var total_budget16 = d3.sum(rawData, function (d) { return +d.fy16budget; });
    var total_budget15 = d3.sum(rawData, function (d) { return +d.fy15budget; });
    var total_budget14 = d3.sum(rawData, function (d) { return +d.fy14budget; });
    var total_budget13 = d3.sum(rawData, function (d) { return +d.fy13budget; });
    var total_budget12 = d3.sum(rawData, function (d) { return +d.fy12budget; });
    var total_budget11 = d3.sum(rawData, function (d) { return +d.fy11budget; });
    var total_budget10 = d3.sum(rawData, function (d) { return +d.fy10budget; });
    var total_budget09 = d3.sum(rawData, function (d) { return +d.fy09budget; });
    var total_budget08 = d3.sum(rawData, function (d) { return +d.fy08budget; });

    // Use map() to convert raw data into node data
    var myNodes = rawData.map(function (d) {
      return {
        x: Math.random() * 900,
        y: Math.random() * 800,
        id: d.id,
        category: d.category,
        radius: radiusScale(+d.fy17salaries + +d.fy17other),
        value: +d.fy17salaries + +d.fy17other,
        name: d.name,
        description: d.description,
        FY17Expenditures: +d.fy17salaries + +d.fy17other,
        FY16Expenditures: +d.fy16salaries + +d.fy16other,
        FY15Expenditures: +d.fy15salaries + +d.fy15other,
        FY14Expenditures: +d.fy14salaries + +d.fy14other,
        FY13Expenditures: +d.fy13salaries + +d.fy13other,
        FY12Expenditures: +d.fy12salaries + +d.fy12other,
        FY11Expenditures: +d.fy11salaries + +d.fy11other,
        FY10Expenditures: +d.fy10salaries + +d.fy10other,
        FY09Expenditures: +d.fy09salaries + +d.fy09other,
        FY08Expenditures: +d.fy08salaries + +d.fy08other,
        FY07Expenditures: +d.fy07salaries + +d.fy07other,
        FY17Budget: +d.fy17budget,
        FY16Budget: +d.fy16budget,
        FY15Budget: +d.fy15budget,
        FY14Budget: +d.fy14budget,
        FY13Budget: +d.fy13budget,
        FY12Budget: +d.fy12budget,
        FY11Budget: +d.fy11budget,
        FY10Budget: +d.fy10budget,
        FY09Budget: +d.fy09budget,
        FY08Budget: +d.fy08budget,
        FY17Salaries: +d.fy17salaries,
        FY16Salaries: +d.fy16salaries,
        FY15Salaries: +d.fy15salaries,
        FY14Salaries: +d.fy14salaries,
        FY13Salaries: +d.fy13salaries,
        FY12Salaries: +d.fy12salaries,
        FY11Salaries: +d.fy11salaries,
        FY10Salaries: +d.fy10salaries,
        FY09Salaries: +d.fy09salaries,
        FY08Salaries: +d.fy08salaries,        
        FY17Other: +d.fy17other,
        FY16Other: +d.fy16other,
        FY15Other: +d.fy15other,
        FY14Other: +d.fy14other,
        FY13Other: +d.fy13other,
        FY12Other: +d.fy12other,
        FY11Other: +d.fy11other,
        FY10Other: +d.fy10other,
        FY09Other: +d.fy09other,
        FY08Other: +d.fy08other,
        FY17Percent: 100 * d.fy17budget / total_budget17,
        FY16Percent: 100 * d.fy16budget / total_budget16,
        FY15Percent: 100 * d.fy15budget / total_budget15,
        FY14Percent: 100 * d.fy14budget / total_budget14,
        FY13Percent: 100 * d.fy13budget / total_budget13,
        FY12Percent: 100 * d.fy12budget / total_budget12,
        FY11Percent: 100 * d.fy11budget / total_budget11,
        FY10Percent: 100 * d.fy10budget / total_budget10,
        FY09Percent: 100 * d.fy09budget / total_budget09,
        FY08Percent: 100 * d.fy08budget / total_budget08
      };
    });

    // sort them to prevent occlusion of smaller nodes (large circles made first)
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  // Default to coloring by category (general funds or special funds)
  var categoryColor = d3.scale.ordinal().domain(['Budgetary department', 'Non-departmental']).range(['#7aa25c', '#509CE7']);

  // color scale for colors based on % growth
  var growthColor = d3.scale.pow()
            .exponent(0.5)
            .domain([-100,0, 100])
            .range(['#C00000', '#FFFFFF', '#00C000']);

  // function for generating legends
  // this is used for the default color setting (by category)
  function makeLegend(x, y, size, colors, labels) {
    // make the legend object
    legend = d3.select('svg').append('g')
      .classed('legend', true)
      .classed('bubble', true)
      .classed('notSelected', true);

    // only make the legend visible in "bubble view"
    var opacity = 1 - d3.select('.detail').attr('opacity');
    legend.attr('opacity', opacity);

    // # of items in the legend
    var n = colors.length;

    // loop to place the items
    var yTmp = y + (size * 0.25) - (n * size * 0.75);
    for (var i=0; i<n; i++){
      legend.append('rect')
        .attr('x', x)
        .attr('y', yTmp + 1.5 * size * i)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]).darker())
        .attr('stroke-width', 2);
      legend.append('text')
        .attr('x', x + 1.5 * size)
        .attr('y', 4 + size/2 + yTmp + 1.5 * size * i)
        .attr('text-anchor', 'center')
        .attr('style', "font-size: " + d3.min([d3.max([10, (size / 2)]), 16]) + "px")
        .text(labels[i]);
    }
  }

  // another function for making legends
  // this one is used for the other color categories, that show a scale
  function makeLegend2(x, y, size, colors, labels) {
    // make the legend object
    legend = d3.select('svg').append('g')
      .classed('legend', true)
      .classed('bubble', true)
      .classed('notSelected', true);

    // only make the legend visible in "bubble view"
    var opacity = 1 - d3.select('.detail').attr('opacity');
    legend.attr('opacity', opacity);

    // # of items in the legend
    var n = colors.length;

    // loop to place the items
    //var yTmp = y + (size * 0.25) - (n * size * 0.75);
    var yTmp = y - (n * size * 0.5);
    for (var i=0; i<n; i++){
      legend.append('rect')
        .attr('x', x)
        .attr('y', yTmp + size * i)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]));
      legend.append('text')
        .attr('x', x + 1.5 * size)
        .attr('y', 4 + size/2 + yTmp + size * i)
        .attr('text-anchor', 'center')
        .attr('style', "font-size: " + d3.min([d3.max([10, (size / 2)]), 16]) + "px")
        .text(labels[i]);
    }
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // Use the max FY_2017_Actual_Receipts in the data as the max in the scale's domain
    // note we have to ensure the FY_2017_Actual_Receipts is a number by converting it
    // with `+`.
    var maxAmount = d3.max(rawData, function (d) { return +d.fy17salaries + +d.fy17other; });
    radiusScale.domain([0, maxAmount]);

    var nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // The detail box. A description and time series plot will appear here
    // when a bubble is clicked. 
    // Draw this box first so it goes underneath the bubbles.
    var detailX = width * 0.167;
    var detailY = height * 0.05;
    var detailW = width * 0.66;
    var detailH = height * 0.9;
    svg.append('rect')
      .classed('detail', true)
      .attr('x', detailX)
      .attr('y', detailY)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('width', detailW)
      .attr('height', detailH)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#000000')
      .attr('opacity', 0);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('g')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .classed('notSelected', true)
      .attr('name', function (d) {return d.name;})
      .attr('r', 0)
      .attr('fill', function (d) { return categoryColor(d.category); })
      .attr('stroke', function (d) { return d3.rgb(categoryColor(d.category)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showFloatingTooltip)
      .on('mouseout', hideFloatingTooltip)
      .on('click', showDetailView);


    // Transition to make bubbles appear, ending with the correct radius
    bubbles.transition()
      .duration(100)
      .attr('r', function (d) { return d.radius; });

    // Add a legend
    makeLegend(width * 0.72, center.y, width / 24, ['#7aa25c', '#509CE7'], ['Budgetary department', 'Non-departmental']);

    /*
    Content for the detailed view.
    */

    // make a button for hiding the detail
    // (won't make it class="button" until the detail is shown)
    svg.append('text')
      .classed('exitButton', true)
      .classed('detail', true)
      .attr('x', detailX + detailW - 30)
      .attr('y', detailY+20)
      .attr('font-size', 14)
      .text('')
      .attr('opacity', 0)
      .on('click', hideDetailView);

    // detail: item description
    svg.append('g')
      .classed('detail', true)
      .classed('description', true)
      .attr('font-style', 'italic')
      .attr('opacity', 0);

    // detail: item name
    svg.append('text')
      .classed('detail', true)
      .classed('name', true)
      .attr('x', detailX+10)
      .attr('y', detailY+25)
      .text('Item name')
      .attr('font-weight', 'bold')
      .attr('font-size', 13)
      .attr('opacity', 0);

    // Set initial layout
    groupBubbles();

  };

  // function for calculating percent growth
  pct_growth = function(d) {
    fiscal_years = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];
    expenditures = [d.FY17Expenditures, d.FY16Expenditures, d.FY15Expenditures, d.FY14Expenditures, d.FY13Expenditures, d.FY12Expenditures, d.FY11Expenditures, d.FY10Expenditures, d.FY09Expenditures, d.FY08Expenditures, d.FY07Expenditures];
    index = fiscal_years.indexOf(currentYear);
    return 100 * (expenditures[index] - expenditures[index+1]) / expenditures[index+1];
  };

  function colorCategories() {
    svg.selectAll('circle')
      .transition()
      .duration(400)
      .attr('fill', function (d) {return categoryColor(d.category); })
      .attr('stroke', function (d) {return d3.rgb(categoryColor(d.category)).darker(); });
  }


  function colorGrowth() {
    // select current year, for calcuating percent growth
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');

    // change colors based on percent growth
    svg.selectAll('circle')
      .transition()
      .duration(400)
      .attr('fill', function (d) {
        value = pct_growth(d);
        if (isNaN(value)) {
          out = '#000000';          
        } else {
          out = growthColor(value);
        }
        return out;
      })
      .attr('stroke', function (d) {
        value = pct_growth(d);
        if (isNaN(value)) {
          out = '#000000';          
        } else {
          out = d3.rgb(growthColor(value)).darker();
        }
        return out;
      });

  }


  /*
   * Sets visualization in "single group mode".
   */
  function groupBubbles() {
    hideCategories();

    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Splits apart the categories
   */
  function splitBubbles() {
    showCategories();

    force.on('tick', function (e) {
      bubbles.each(moveToCategories(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "single group mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it toward the center of
   * the visualization.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  function moveToCategories(alpha) {
    return function (d) {
      var target = categoryCenters[d.category];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides category title displays.
   */
  function hideCategories() {
    svg.selectAll('.category').remove();
  }

  /*
   * Shows category title displays.
   */
  function showCategories() {
    // Another way to do this would be to create
    // the category texts once and then just hide them.
    var categoryData = d3.keys(categoryTitleX);
    var category = svg.selectAll('.category')
      .data(categoryData);

    category.enter().append('text')
      .classed('category', true)
      .classed('bubble', true)
      .attr('x', function (d) { return categoryTitleX[d]; })
      .attr('y', height * 0.15)
      .attr('text-anchor', 'middle')
      .attr('style', "font-size: " + label_size)
      .text(function (d) { return d; });
  }

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showFloatingTooltip(d) {
    // make the cursor a hand so users see they can click on the bubble
    d3.select(this).style("cursor", "pointer");

    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    // x and y positions for the tooltip
    // based on circle's coordinates and radius
    cx = +d3.select(this).attr('cx');
    cy = +d3.select(this).attr('cy');
    r = +d3.select(this).attr('r');

    // select current fiscal year for generating content
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');

    // necessary variables for generating content
    fiscal_years = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];
    budgets = [d.FY17Budget, d.FY16Budget, d.FY15Budget, d.FY14Budget, d.FY13Budget, d.FY12Budget, d.FY11Budget, d.FY10Budget, d.FY09Budget, d.FY08Budget];
    expenditures = [d.FY17Expenditures, d.FY16Expenditures, d.FY15Expenditures, d.FY14Expenditures, d.FY13Expenditures, d.FY12Expenditures, d.FY11Expenditures, d.FY10Expenditures, d.FY09Expenditures, d.FY08Expenditures, d.FY07Expenditures];
    salaries = [d.FY17Salaries, d.FY16Salaries, d.FY15Salaries, d.FY14Salaries, d.FY13Salaries, d.FY12Salaries, d.FY11Salaries, d.FY10Salaries, d.FY09Salaries, d.FY08Salaries];
    others = [d.FY17Other, d.FY16Other, d.FY15Other, d.FY14Other, d.FY13Other, d.FY12Other, d.FY11Other, d.FY10Other, d.FY09Other, d.FY08Other];
    percents = [d.FY17Percent, d.FY16Percent, d.FY15Percent, d.FY14Percent, d.FY13Percent, d.FY12Percent, d.FY11Percent, d.FY10Percent, d.FY09Percent, d.FY08Percent];

    // index of current year
    index = fiscal_years.indexOf(currentYear);

    // generate content
    fyText = fiscal_years[index];
    salaries_tmp = salaries[index];
    others_tmp = others[index];
    expenditures_tmp = expenditures[index];
    budget_tmp = budgets[index];
    pct_growth_tmp = Math.ceil(100 * 100 * (expenditures[index] - expenditures[index+1]) / expenditures[index+1])/100;

    var content = '<span class="name">' + d.name + '</span>' +
                  '<table><tr><td colspan="2" style="text-align:center; text-decoration: underline">Fiscal Year ' + fyText + '</td></tr>' + 
                  '<tr height=5px></tr>' +
                  '<tr><td>Salaries</td><td style="text-align: center">' + formatAmount(salaries_tmp) + '</td></tr>' +
                  '<tr><td>Other</td><td style="text-align: center">' + formatAmount(others_tmp) + '</td></tr>' +
                  '<tr><td>Total</td><td style="text-align: center">' + formatAmount(expenditures_tmp) + '</td></tr>' +
                  '<tr><td>Annual growth</td><td style="text-align: center">' + formatPercent(pct_growth_tmp) + '</td></tr>' + 
                  '<tr height=5px></tr>' + 
                  '<tr><td>Budget</td><td style="text-align: center">' + formatAmount(budget_tmp) + '</td></tr>' +
                  '<tr><td>Percent of total budget</td><td style="text-align: center">' + formatPercent(percents[index]) + '</td></tr></table>' + 
                  '<div style="height: 5px"></div>' + 
                  '<p style="text-align: center; margin: 0px 0px 0px 0px">(Click bubble for more info)</p>';

    // check that the tooltip is active before displaying it
    // (tooltip is de-activated when detail chart is being shown)
    tooltipActive = d3.select('#floatingTooltip').classed('active');
    if (tooltipActive) {
      floating_tooltip.revealTooltip(content, cx, cy, r);
    }
  }

  /*
   * Hides tooltip
   */
  function hideFloatingTooltip(d) {
    // make the cursor an arrow
    d3.select(this).style("cursor", "default");

    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(d3.select(this).attr('fill')).darker());

    floating_tooltip.hideTooltip();
  }

  function showDetailView(d){
    // disable the buttons
    disableButtons();

    // disable the floating tooltip
    d3.select('#floatingTooltip').classed('active', false);

    // disable bubble click functionality
    d3.selectAll('.bubble')
      .on('click', function () {})
      .on('mouseover', function(d) {d3.select(this).style('cursor', 'default')});

    // show detail objects
    d3.selectAll('.detail')
      .transition()
      .duration(100)
      .attr('opacity', 1);

    // hide everything else
    d3.selectAll('.bubble').classed('hidden', true);

    // hide the tooltip
    floating_tooltip.hideTooltip();

    // keep a pointer to the canvas
    var svg = d3.select('svg');

    // activate the exit button
    d3.select('.exitButton')
      .classed('button', true)
      .text('Exit')
      .on({
      "mouseover": function(d) {
        d3.select(this).style("cursor", "pointer"); 
      },
      "mouseout": function(d) {
        d3.select(this).style("cursor", "default"); 
      }
    });

    // make the graph
    var yearArray = ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017'];
    var salaryArray = [+d.FY08Salaries, +d.FY09Salaries, +d.FY10Salaries, +d.FY11Salaries, +d.FY12Salaries, +d.FY13Salaries, +d.FY14Salaries, +d.FY15Salaries, +d.FY16Salaries, +d.FY17Salaries];
    var otherArray = [+d.FY08Other, +d.FY09Other, +d.FY10Other, +d.FY11Other, +d.FY12Other, +d.FY13Other, +d.FY14Other, +d.FY15Other, +d.FY16Other, +d.FY17Other];
    var budgetArray = [+d.FY08Budget, +d.FY09Budget, +d.FY10Budget, +d.FY11Budget, +d.FY12Budget, +d.FY13Budget, +d.FY14Budget, +d.FY15Budget, +d.FY16Budget, +d.FY17Budget];
    var myData = yearArray.map(function(val, index) {
      return {year: val, budget: budgetArray[index]/1e6, salary: salaryArray[index]/1e6, other: otherArray[index]/1e6}
    });

    // get the location and size of the rectangle we're drawing in
    var detailX = d3.selectAll('rect').filter('.detail').attr('x');
    var detailY = d3.selectAll('rect').filter('.detail').attr('y');
    var detailW = d3.selectAll('rect').filter('.detail').attr('width');
    var detailH = d3.selectAll('rect').filter('.detail').attr('height');

    var graphX = +detailX + 60;
    var graphWidth = +detailW - 110;
    var graphY = +detailY + 150;
    var graphHeight = +detailH - +graphY - 40;
    var graphBottom = graphY + graphHeight;

    // item description font size
    var description_size = d3.min([d3.max([8, (height / 35)]), 13]) + "px";

    // item description
    var myDesc = d.description;
    itemDesc = d3.selectAll('g').filter('.description');
    itemDesc.append("foreignObject")
      .attr('id', 'descriptionObject')
      .attr('x', +detailX + 10)
      .attr('y', +detailY + 15)
      .attr("width", +detailW - 40)
      .attr('height', 100)
      .append("xhtml:body")
      .html('<p id="itemDescription" style="font-size: 13px">'+ myDesc + '</p>');

    // resize the text to fit in the box
    // https://stackoverflow.com/questions/6112660/how-to-automatically-change-the-text-size-inside-a-div
    // I use modernizr to check for SVG foreignObject support. https://modernizr.com
    if (Modernizr.svgforeignobject | warned) {
      // supported
      $(function() {
        while( $('#itemDescription').height() + 20 > 100 ) {
          $('#itemDescription').css('font-size', (parseInt($('#itemDescription').css('font-size')) - 1) + "px" );
        }
      });
    } else {
      // not-supported
      alert("Sorry! Your browser isn't fully compatible with this feature. Try using a browser with SVG foreignObject support.")
      warned = true;
    }

    // item name
    itemName = d3.selectAll('text').filter('.name');
    itemName.text(d.name);

    // putting together the graph
    var parseTime = d3.time.format("%Y").parse;

    var ymin = d3.min([d3.min(salaryArray), d3.min(otherArray)])/1e6;
    var ymax = d3.max([d3.max(salaryArray), d3.max(otherArray)])/1e6;
    //var ymin = d3.min([d3.min(salaryArray), d3.min(otherArray), d3.min(budgetArray)])/1e6;
    //var ymax = d3.max([d3.max(salaryArray), d3.max(otherArray), d3.max(budgetArray)])/1e6;

    var xScale = d3.time.scale()
      .range([graphX, graphX + graphWidth])
      .domain([parseTime(d3.min(yearArray)),parseTime(d3.max(yearArray))]);
    var yScale = d3.scale.linear()
      .range([graphY + graphHeight, graphY])
      .domain([ymin, ymax])
      .nice();

    var budgetLine = d3.svg.line()
      .x(function(d) { return xScale(parseTime(d.year)); })
      .y(function(d) { return yScale(d.budget); });

    var salaryLine = d3.svg.line()
      .x(function(d) { return xScale(parseTime(d.year)); })
      .y(function(d) { return yScale(d.salary); });

    var otherLine = d3.svg.line()
      .x(function(d) { return xScale(parseTime(d.year)); })
      .y(function(d) { return yScale(d.other); });
    
    svg.append("g")
        .attr("class", "axis axis--x")
        .classed('detail', true)
        .attr("transform", "translate(0,"+ graphBottom + ")")
        .call(d3.svg.axis().scale(xScale).orient('bottom'))
        .attr('opacity', 1);
    
    svg.append("g")
        .attr("class", "axis axis--y")
        .classed('detail', true)
        .attr('transform', 'translate(' + graphX + ',0)')
        .call(d3.svg.axis().scale(yScale).ticks(7).orient('left'))
        .append("text")
        .attr('x', -45)
        .attr('y', graphY - 25)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("$ (Millions)")
        .attr('opacity', 1);

    var item = svg.selectAll('.item')
      .data([myData])
      .enter().append('g')
      .attr('class', 'item');

    //item.append('path')
    //  .attr('class', 'line')
    //  .classed('detail', true)
    //  .attr('d', function (d) {return budgetLine(myData);})
    //  .attr('stroke', 'black')
    //  .attr('opacity', 1);

    item.append('path')
      .attr('class', 'line')
      .classed('detail', true)
      .attr('d', function (d) {return salaryLine(myData);})
      .attr('stroke', 'steelblue')
      .attr('opacity', 1);

    item.append('path')
      .attr('class', 'line')
      .classed('detail', true)
      .attr('d', function (d) {return otherLine(myData);})
      .attr('stroke', 'darkgreen')
      .attr('opacity', 1);

    // Make a legend
    plotLegend = d3.select('svg').append('g')
      .classed('plotLegend', true)
      .classed('detail', true);

    // legend parameters/variables
    var x = graphX + graphWidth/2 - 60;
    var y = graphY + graphHeight + 35;
    var size = 10;
    //var colors = ['black', 'steelblue', 'darkgreen'];
    //var labels = ['Budget', 'Salaries', 'Other'];
    var colors = ['steelblue', 'darkgreen'];
    var labels = ['Salaries', 'Other'];
    var n = colors.length;

    // loop to place the items
    var xTmp = x + (size * 0.25) - (n * size * 0.75);
    for (var i=0; i<n; i++){
      plotLegend.append('rect')
        .attr('x', xTmp + 10 * size * i)
        .attr('y', y)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]).darker())
        .attr('stroke-width', 2);
      plotLegend.append('text')
        .attr('font-size', 12)
        .attr('x', 15 + xTmp + 10 * size * i)
        .attr('y', y + 10)
        .attr('text-anchor', 'center')
        .text(labels[i]);
    } 

  }

  function hideDetailView() {

    // enable the buttons
    setupButtons();

    // enable the bubble click and mouseover functionality
    d3.selectAll('circle')
      .on('click', showDetailView)
      .on('mouseover', showFloatingTooltip);
    
    // make details invisible
    d3.selectAll('.detail')
      .transition()
      .duration(100)
      .attr('opacity', 0);

    // make bubbles visible
    d3.selectAll('.bubble').classed('hidden', false);

    // remove graph
    d3.selectAll('.axis').remove();
    d3.selectAll('.line').remove();
    d3.selectAll('.item').remove();
    d3.selectAll('.plotLegend').remove();

    // remove text
    d3.selectAll('text').filter('.name').text('');
    d3.selectAll('foreignObject').remove();

    // unselect all bubbles
    d3.selectAll('.bubble')
      .classed('selected', false);

    // activate the tooltip
    d3.select('#floatingTooltip')
      .classed('active', true);

    // deactivate the exit button
    d3.select('.exitButton').classed('button', false);
    d3.select('.exitButton').on('mouseover', function(d) {d3.select(this).style('cursor', 'default')});

  }

  /*
   * Externally accessible functions for toggling between different options
   */
  chart.toggleDisplay = function () {
    // get the active setting
    currentScheme = d3.select('#split_toolbar').selectAll('.btn').filter('.active').attr('id');
    if (currentScheme === 'category') {
      splitBubbles();
    } else {
      groupBubbles();
    }
  };

  chart.toggleColor = function () {
    // find the active color scheme
    colorScheme = d3.select('#color_toolbar').selectAll('.btn').filter('.active').attr('id');

    if (colorScheme === 'category') {
      colorCategories();
      d3.selectAll('.legend').remove();
      makeLegend(width * 0.72, center.y, width / 25, ['#7aa25c', '#509CE7'], ['Budgetary department','Non-departmental']);
    } else if (colorScheme === 'growth') {
      colorGrowth();
      d3.selectAll('.legend').remove();
      makeLegend2(width * 0.72, center.y, width / 30, 
        [growthColor(100), growthColor(50), growthColor(25), growthColor(12.5), growthColor(0), 
        growthColor(-12.5), growthColor(-25), growthColor(-50), growthColor(-100), '#000000'], 
        ['100% +', '50%', '25%', '12.5%', '0%', '-12.5%', '-25%', '-50%', '-100%', 'Undefined']);
    }
  };

  // return the radius for a particular bubble, given a scale variable and year
  findRadius = function (d, scaleVar, year) {
    // pick out the index of the current year
    fiscal_years = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];
    index = fiscal_years.indexOf(currentYear);

    // set "values" array equal to array of scale variable
    if (scaleVar=='total') {
      values = [+d.FY17Expenditures, +d.FY16Expenditures, +d.FY15Expenditures, +d.FY14Expenditures, +d.FY13Expenditures, +d.FY12Expenditures, +d.FY11Expenditures, +d.FY10Expenditures, +d.FY09Expenditures, +d.FY08Expenditures];
    } else if (scaleVar=='salaries'){
      values = [+d.FY17Salaries, +d.FY16Salaries, +d.FY15Salaries, +d.FY14Salaries, +d.FY13Salaries, +d.FY12Salaries, +d.FY11Salaries, +d.FY10Salaries, +d.FY09Salaries, +d.FY08Salaries];
    } else if (scaleVar=='other') {
      values = [+d.FY17Other, +d.FY16Other, +d.FY15Other, +d.FY14Other, +d.FY13Other, +d.FY12Other, +d.FY11Other, +d.FY10Other, +d.FY09Other, +d.FY08Other];
    }

    // return the desired value
    return radiusScale(values[index]);
  }


  chart.toggleYear = function () {

    // find the active year, color scheme, and scaling variable
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');
    colorScheme = d3.select('#color_toolbar').selectAll('.btn').filter('.active').attr('id');
    currentScale = d3.select('#scale_toolbar').selectAll('.btn').filter('.active').attr('id');

    // select all the circles and bubbles
    circles = d3.selectAll('circle');

    // change the radius and color
    circles.transition().duration(400)
      .attr('r', function (d) {return findRadius(d, currentScale, currentYear);})
      .attr('fill', function (d) {
        if (colorScheme == 'category') {
          return categoryColor(d.category);
        } else if (colorScheme = 'growth'){
          value = pct_growth(d);
          if (isNaN(value)) {
            out = '#000000';          
          } else {
            out = growthColor(value);
          }
          return out;
        }
      })
      .attr('stroke', function (d) {
        if (colorScheme == 'category') {
          return d3.rgb(categoryColor(d.category)).darker(); 
        } else if (colorScheme == 'growth') {
          value = pct_growth(d);
          if (isNaN(value)) {
            out = '#000000';          
          } else {
            out = d3.rgb(growthColor(value)).darker();
          }
          return out;          
        }
      });

    // change the charge
    force.charge(function (d) {return -Math.pow(findRadius(d, currentScale, currentYear), 2.0)/8;});
    force.start();

  };


  chart.toggleScale = function () {
    // find the active scale, year, and color schemes
    currentScale = d3.select('#scale_toolbar').selectAll('.btn').filter('.active').attr('id');
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');
    colorScheme = d3.select('#color_toolbar').selectAll('.btn').filter('.active').attr('id');

    // select all the circles and bubbles
    circles = d3.selectAll('circle');

    // change the radius
    circles.transition().duration(400)
      .attr('r', function (d) {return findRadius(d, currentScale, currentYear);})

    // change the charge
    force.charge(function (d) {return -Math.pow(findRadius(d, currentScale, currentYear), 2.0)/8;});
    force.start();
  };


  // return the chart function from closure.
  return chart;
}

// create an instance of the chart
var myBubbleChart = bubbleChart();

// function to call on the data
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

// Sets up the buttons to allow for toggling between different options.
function setupButtons() {
  d3.selectAll('.btn-group')
    .selectAll('.btn')
    .on('click', function () {
      // set all buttons on the clicked toolbar as inactive, then activate the clicked button
      var p = d3.select(this.parentNode);
      p.selectAll('.btn').classed('active', false);
      d3.select(this).classed('active', true);

      // toggle
      if (p.attr('id')=='scale_toolbar') {
        myBubbleChart.toggleScale();
      } else if (p.attr('id')=='split_toolbar') {
        myBubbleChart.toggleDisplay();
      } else if (p.attr('id')=='color_toolbar') {
        myBubbleChart.toggleColor();
      } else if (p.attr('id')=='year_toolbar') {
        myBubbleChart.toggleYear();
      }
    });
}

// function to disable the buttons when in detail view
function disableButtons() {
  d3.selectAll('.btn-group')
    .selectAll('.btn')
    .on('click', function () {});
}

// Load the data and call the "display" function
d3.csv('data/expenditures.csv', display);

// has the user been warned about compatibility issues?
var warned = false;

// set up the buttons.
setupButtons();
