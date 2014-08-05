
register_engine('hbs', function(params) {
  var Handlebars = require('handlebars');

  var compile  = function(client) {
    var method = client ? 'precompile' : 'compile',
        tpl = Handlebars[method](params.source, defs_tpl('handlebars', params));

    if (client) {
      return 'Handlebars.template(' + tpl.toString() + ')';
    }

    return tpl;
  };

  if (!params.chain) {
    return compile(true);
  }

  return compile();
});
