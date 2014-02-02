
register_engine('html', function(params, next) {
  /* jshint evil:true */
  var body = 'return ' + JSON.stringify(params.source) + ';',
      fn = new Function('', body);

  if (next('js', 'ract')) {
    if ([params.next, params.ext].indexOf('js') > -1) {
      return fn.toString();
    }

    return params.source;
  }

  return fn;
});
