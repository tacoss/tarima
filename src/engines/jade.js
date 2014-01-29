
register_engine('jade', function(params, jade) {
  var compile = function(client) {
    params.options.client = client;

    return jade.compile(params.source, defs_tpl('jade', params.options));
  };

  if ('js' === params.next) {
    return compile(true).toString();
  }

  if ('jade' !== params.next) {
    return !params.call ? compile()(params.options.locals) : compile();
  }
}, require('jade'));
