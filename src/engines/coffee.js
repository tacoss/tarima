
register_engine('coffee', function(params, next) {
  var coffee = require('coffee-script');

  var tpl =  coffee.compile(params.source, defs_tpl('coffee', params.options)),
      body = 'with(locals_||{}){' + tpl.toString() + '}',
      fn;

  /* jshint evil:true */
  fn = new Function('locals_', body);

  if (next('js')) {
    return fn.toString();
  }

  return fn;
});
