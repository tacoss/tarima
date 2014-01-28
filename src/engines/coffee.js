
register_engine('coffee', function(params) {
  var tpl =  require('coffee-script').compile(params.source, defs_tpl('coffee', params.options)),
      compile = function(code) {
        /* jshint evil:true */
        return new Function('locals_', 'with(locals_||{}){' + code.toString() + '}');
      };


  if ('js' === params.next) {
    return compile(tpl).toString();
  }

  if ('html' === params.next) {
    return compile(tpl)(params.options.locals);
  }

  if (!params.next) {
    return params.call ? compile(tpl).toString(): compile(tpl);
  }

  return params.source;
});
