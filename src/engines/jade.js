
register_engine('jade', function(params, next) {
  var jade = require('jade');

  var compile = function(client) {
    params.options.client = client;

    return jade.compile(params.source, defs_tpl('jade', params.options));
  };

  if (!params.call || next('js', 'html', 'ract')) {
    if (!params.next && 'js' === params.ext) {
      return compile(true).toString();
    }
  }

  return compile();
});
