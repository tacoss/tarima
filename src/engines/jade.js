
register_engine('jade', function(params) {
  var compile = function(exec) {
    params.options.client = exec;

    return require('jade').compile(params.source, defs_tpl('jade', params.options));
  };

  if (!params.next || params.call) {
    return compile(true);
  }

  switch (params.next) {
    case 'js':
      return compile(true);
    case 'html':
      return compile();
    default:
      return params.source;
  }
});
