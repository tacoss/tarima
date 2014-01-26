
register_engine('eco', function(params) {
  return require('eco').compile(params.source, defs_tpl('eco', params.options));
});
