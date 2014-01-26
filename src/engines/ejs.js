
register_engine('ejs', function(params) {
  return require('ejs').compile(params.source, defs_tpl('ejs', params.options));
});
