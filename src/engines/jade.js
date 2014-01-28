
register_engine('jade', function(params, jade) {
  var compile = function(client) {
    params.options.client = client;

    return jade.compile(params.source, defs_tpl('jade', params.options));
  };


  switch (params.next) {
    case 'js':
      return compile(true).toString();
    case 'us':
    case 'hbs':
    case 'html':
      return compile()(params.options.locals);
  }

  if (!params.next) {
    return compile(!params.call);
  }

  return params.source;
}, require('jade'));
