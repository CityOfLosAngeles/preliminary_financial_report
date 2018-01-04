
/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];

  if (x.length > 1) {
    x2 = x[1];
  } else {
    x2 = '';
  }

  while (x2.length < 2) {
      x2 = x2 + "0";
  }
  x2 = '.' + x2;

  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

function formatAmount(n) {
  if (n >= 1e9) {
    out = addCommas(Math.round(n / 1e7) / 100) + ' billion';
  } else if (n >= 1e6) {
    out = addCommas(Math.round(n / 1e4) / 100) + ' million';
  } else {
    out = addCommas(n);
  }
  var check = isFinite(n)
  if (!check) {
    out = n;
  } else {
    out = '$' + out;
  }
  return out;
}

function formatPercent(n) {
  var check = isFinite(n)
  var nRound = Math.ceil(100*n)/100;
  var nStr = nRound + '';
  var x = nStr.split('.');
  var x1 = x[0];

  if (x.length > 1) {
    x2 = x[1];
  } else {
    x2 = '';
  }

  while (x2.length < 2) {
      x2 = x2 + "0";
  }
  x2 = '.' + x2;

  if (check) {
    out = x1 + x2 + "%";
  } else {
    out = n;
  }
  return out;
}
