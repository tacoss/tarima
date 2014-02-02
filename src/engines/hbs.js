
register_engine('hbs', function(params) {
  var Handlebars = require('handlebars');

  var compile  = function(client) {
    var method = client ? 'precompile' : 'compile',
        tpl = Handlebars[method](params.source, defs_tpl('handlebars', params.options));

    if (client) {
      return 'Handlebars.template(' + tpl.toString() +')';
    }

    return tpl;
  };


  if ([params.next, params.ext].indexOf('js') > -1) {
    return compile(true).toString();
  }

  return compile(!params.call);
});
