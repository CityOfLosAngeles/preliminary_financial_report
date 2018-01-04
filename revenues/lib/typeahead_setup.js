// inspired by/based on https://twitter.github.io/typeahead.js/examples/

// Set up the typeahead the first time it's selected (put in focus)
$('.typeahead').focus(function(){

  if (d3.select('.typeahead').classed('notClicked')) {

    // class the typeahead as clicked (or, not notClicked)
    d3.select('.typeahead').classed('notClicked', false);

    // Defining the local dataset
    var itemNames = [];
    d3.selectAll('circle').each(function (d) {itemNames.push(d.name)});
    itemNames.sort();
    
    // function for string matching
      var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
          var matches, substringRegex;

          // an array that will be populated with substring matches
          matches = [];

          // regex used to determine if a string contains the substring `q`
          substrRegex = new RegExp(q, 'i');

          // iterate through the pool of strings and for any string that
          // contains the substring `q`, add it to the `matches` array
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              matches.push(str);
            }
          });

          cb(matches);
        };
      };
    
    // Initializing the typeahead
    $('.typeahead').typeahead({
        hint: true,
        highlight: true, /* Enable substring highlighting */
        minLength: 1 /* Specify minimum characters required for showing result */    
    },
    {
        name: 'itemNames',
        source: substringMatcher(itemNames)
    });

    // if the user hits enter, exit the form
    $('.typeahead').keypress(function (e) {
      if (e.which == 13) {
        $('.typeahead').blur();
      }
    });

    // when exiting the form, check for a match and highlight as necessary
    $('.typeahead').bind('typeahead:close', function(ev) {
      index = itemNames.indexOf(ev.target.value);
      if (index==-1){
        //bubbles = d3.selectAll('.bubble').classed('grayOut', false);
        circles = d3.selectAll('circle').classed('grayOut', false).classed('highlighted', false);
      } else {
        //bubbles = d3.selectAll('.bubble');
        //bubbles.classed('grayOut', true);
        circles = d3.selectAll('circle');
        circles.classed('grayOut', function (d) {return d.name!=ev.target.value});
        circles.classed('highlighted', function (d) {return d.name==ev.target.value});
      }
    });
    $('.typeahead').focus();
  } // end of if statement
}); // end of function
