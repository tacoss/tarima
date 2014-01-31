
register_engine('json', function(params, next) {
  /* jshint evil:true */
  var fn = new Function('', 'return ' + params.source.replace(/^\s*/, '') + ';');

  if (next('js')) {
    return fn.toString();
  }

  return fn;
});
