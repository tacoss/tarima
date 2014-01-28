
register_engine('jade', function(params) {
  var compile = function(client) {
    params.options.client = client;

    return require('jade').compile(params.source, defs_tpl('jade', params.options));
  };


  if ('js' === params.next) {
    return compile(true).toString();
  }

  if ('html' === params.next) {
    return compile()(params.options.locals);
  }

  if (!params.next) {
    return compile(!params.call);
  }

  return params.source;
});
