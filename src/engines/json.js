
register_engine('json', function(params, next) {
  if (next('js')) {
    /* jshint evil:true */
    return new Function('', 'return ' + params.source.trim() + ';');
  }
});
