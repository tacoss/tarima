
register_engine('jade', function(params, next) {
  var jade = require('jade');

  var compile = function(client, render) {
    params.options.client = client;

    return jade[render ? 'render' : 'compile'](params.source, defs_tpl('jade', params.options));
  };

  if (!params.call || next('js', 'html')) {
    if ([params.next, params.ext].indexOf('html') > 0) {
      return compile(false, true);
    }

    return compile(true).toString();
  }

  return compile();
});
