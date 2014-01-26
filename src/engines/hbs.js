
register_engine('hbs', function(params) {
  var method = params.head ? 'compile' : 'precompile';

  return require('handlebars')[method](params.source, defs_tpl('handlebars', params.options));
});
