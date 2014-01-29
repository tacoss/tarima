
register_engine('ract', function(params) {
  var tpl = require('ractive').parse(params.source, defs_tpl('ractive', params.options)),
      body = 'return ' + ('string' === typeof tpl ? tpl : JSON.stringify(tpl)) + ';',
      fn;

  /* jshint evil:true */
  fn = new Function('', body);

  if ('js' === params.next) {
    return fn.toString();
  }

  if ('ract' !== params.next) {
    return !params.call ? params.source : fn;
  }
});
