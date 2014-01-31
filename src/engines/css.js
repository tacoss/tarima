
register_engine('css', function(params, next) {
  /* jshint evil:true */
  var body = 'return ' + JSON.stringify(params.source) + ';',
      fn = new Function('', body);

  if (next('js')) {
    return fn.toString();
  }

  return fn;
});
