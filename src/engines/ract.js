
register_engine('ract', function(params, next) {
  var Ractive = require('ractive');

  var tpl = Ractive.parse(params.source, defs_tpl('ractive', params.options)),
      body = 'return ' + ('string' === typeof tpl ? tpl : JSON.stringify(tpl)) + ';',
      fn;

  /* jshint evil:true */
  fn = new Function('', body);

  if (next('js')) {
    return fn.toString();
  }

  return fn;
});
