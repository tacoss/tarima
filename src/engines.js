
register_engine('ejs', function(params) {
  return require('ejs').compile(params.source, defs_tpl('ejs', params.options));
});

register_engine('eco', function(params) {
  return require('eco').compile(params.source, defs_tpl('eco', params.options));
});

register_engine('less', function(params) {
  var less = require('less'),
      compiled;

  if (!params.head) {
    compiled = params.source;
  } else {
    compiled = function(locals) {
      var output, parser,
          vars = [];

      var inject = function(from) {
        for (var key in from) {
          if (/boolean|number|string/.test(typeof from[key])) {
            vars.push('@' + key + ': ~' + JSON.stringify(from[key].toString()) + ';');
          }
        }
      };

      inject(params.options.locals);
      inject(locals);

      parser = new less.Parser(defs_tpl('less', params.options));
      parser.parse(vars.concat([params.source]).join('\n'), function(e, tree) {
        output = tree.toCSS();
      });

      return output;
    };
  }

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
