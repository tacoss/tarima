
register_engine('coffee', function(params) {
  return require('coffee-script').compile(params.source, defs_tpl('coffee', params.options));
});
