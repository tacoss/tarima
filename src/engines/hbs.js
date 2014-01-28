
register_engine('hbs', function(params, Handlebars) {
  var compile  = function(client) {
    var method = client ? 'precompile' : 'compile',
        tpl = Handlebars[method](params.source, defs_tpl('handlebars', params.options));

    if (client) {
      return 'Handlebars.template(' + tpl.toString() +')';
    }

    return tpl;
  };


  switch (params.next) {
    case 'js':
      return compile(true).toString();
    case 'md':
    case 'us':
    case 'jade':
    case 'html':
    case 'less':
    case 'coffee':
      return compile()(params.options.locals);
  }

  if (!params.next) {
    return compile(!params.call);
  }

  return params.source;
}, require('handlebars'));
