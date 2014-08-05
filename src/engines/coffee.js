
register_engine('coffee', function(params, next) {
  var coffee = require('coffee-script');

  if (next('js')) {
    /* jshint evil:true */
    var tpl = new Function('', coffee.compile(params.source, defs_tpl('coffee', params)));

    if (!params.chain) {
      return tpl.toString();
    }

    return tpl;
  }
});
