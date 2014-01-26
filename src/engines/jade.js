
register_engine('jade', function(params) {
  params.options.client = !params.head;

  return require('jade').compile(params.source, defs_tpl('jade', params.options));
});
