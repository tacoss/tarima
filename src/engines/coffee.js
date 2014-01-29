
register_engine('coffee', function(params, coffee) {
  var body, tpl, fn;

  tpl =  coffee.compile(params.source, defs_tpl('coffee', params.options));
  body = 'with(locals_||{}){' + tpl.toString() + '} return "";';

  /* jshint evil:true */
  fn = new Function('locals_', body);

  if ('js' === params.next) {
    return tpl.toString();
  }

  if ('coffee' !== params.next) {
    return !params.call ? fn(params.options.locals) : fn;
  }
}, require('coffee-script'));
