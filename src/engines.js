
register_engine('ejs', function(params) {
  return require('ejs').compile(params.source, defs_tpl('ejs', params.options));
});

register_engine('eco', function(params) {
  return require('eco').compile(params.source, defs_tpl('eco', params.options));
});

register_engine('less', function(params) {
  var less = require('less'),
      parser = new less.Parser(defs_tpl('less', params.options)),
      compiled;

  parser.parse(params.source, function(e, tree) {
    compiled = tree.toCSS();
  });

  return compiled;
});

register_engine('ract', function(params) {
  return require('ractive').parse(params.source, defs_tpl('ractive', params.options));
});

register_engine('coffee', function(params) {
  return require('coffee-script').compile(params.source, defs_tpl('coffee', params.options));
});

register_engine('jade', function(params) {
  params.options.client = !params.head;

  return require('jade').compile(params.source, defs_tpl('jade', params.options));
});

register_engine('hbs', function(params) {
  var method = params.head ? 'compile' : 'precompile';

  return require('handlebars')[method](params.source, defs_tpl('handlebars', params.options));
});

register_engine('us', function(params) {
  return _.template(params.source, null, defs_tpl('lodash', params.options));
});
