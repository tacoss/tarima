
register_engine('css', function(params) {
  /* jshint evil:true */
  var body = 'return ' + JSON.stringify(params.source) + ';',
      fn = new Function('', body);

  if ('js' === params.next) {
    return body;
  }

  if (params.call) {
    return fn;
  }
});
