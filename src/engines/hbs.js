
register_engine('hbs', function(params, next) {
  var Handlebars = require('handlebars');

  var compile  = function(client) {
    var method = client ? 'precompile' : 'compile',
        tpl = Handlebars[method](params.source, defs_tpl('handlebars', params.options));

    if (client) {
      return 'Handlebars.template(' + tpl.toString() +')';
    }

    return tpl;
  };


  if ('js' === params.next || (!params.next && 'js' === params.ext)) {
    return compile(true).toString();
  }

  return compile()(params.options.locals);
});
