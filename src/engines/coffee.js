
register_engine('coffee', function(params, coffee) {
  var tpl =  coffee.compile(params.source, defs_tpl('coffee', params.options)),
      compile = function(code) {
        /* jshint evil:true */
        return new Function('locals_', 'with(locals_||{}){' + code.toString() + '}');
      };


  switch (params.next) {
    case 'js':
      return compile(tpl).toString();
    case 'html':
      return compile(tpl)(params.options.locals);
  }

  if (!params.next) {
    return params.call ? compile(tpl).toString(): compile(tpl);
  }

  return params.source;
}, require('coffee-script'));
