
register_engine('html', function(params) {
  /* jshint evil:true */
  var body = 'return ' + JSON.stringify(params.source) + ';',
      fn = new Function('', body);

  if ('js' === params.next) {
    return fn.toString();
  }

  if (!params.next) {
    return params.call ? fn : fn.toString();
  }
});
