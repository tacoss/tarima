
register_engine('ract', function(params) {
  return require('ractive').parse(params.source, defs_tpl('ractive', params.options));
});
