
register_engine('jade', function(params) {
  var compile = function(exec) {
    params.options.client = exec;

    return require('jade').compile(params.source, defs_tpl('jade', params.options));
  };


  switch (params.next) {
    case 'jade':
      return compile(true).toString();
    case 'js':
      return compile(true);
    case 'html':
      return compile();
    default:
      if (!params.next) {
        return compile(true);
      }

      return params.source;
  }
});
