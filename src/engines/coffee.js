
register_engine('coffee', function(params, next) {
  var coffee = require('coffee-script');

  if (next('js')) {
    /* jshint evil:true */
    return new Function('', coffee.compile(params.source, defs_tpl('coffee', params)));
  }
});
