// Code from http://vallandingham.me/bubble_charts_in_js.html

/*
 * Creates tooltip with provided id that
 * floats on top of visualization.
 * Most styling is expected to come from CSS
 * so check out bubble_chart.css for more details.
 */
function floatingTooltip(tooltipId, width) {
  // Local variable to hold tooltip div for
  // manipulation in other functions.
  var tt = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', tooltipId)
    .style('pointer-events', 'none');

  // Set a width if it is provided.
  if (width) {
    tt.style('width', width);
  }

  // Initially it is hidden.
  hideTooltip();

  /*
   * Display tooltip with provided content.
   * content is expected to be HTML string.
   */
  function revealTooltip(content, cx, cy, r) {
    tt.style('opacity', 1.0)
      .html(content);

    updatePosition(cx, cy, r);
  }

  /* Hide the tooltip div. */
  function hideTooltip() {
    tt.style('opacity', 0.0);
  }

  /* Place the tooltip based on circle's position */
  function updatePosition(cx, cy, r) {
 
    // get position of SVG
    vis = document.getElementById('vis');
    visX = vis.getBoundingClientRect().x;
    visY = vis.getBoundingClientRect().y;

    // get width and height of tooltip
    var ttw = tt.style('width');
    var tth = tt.style('height');
    ttw = +ttw.substring(0, ttw.length - 2);
    tth = +tth.substring(0, tth.length - 2);

    tttop = visY + cy - r - tth - 10;
    ttleft = visX + cx - (ttw / 2);

    tt.style({ top: tttop + 'px', left: ttleft + 'px' });
  }


  return {
    revealTooltip: revealTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  };
}