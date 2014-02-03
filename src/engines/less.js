
register_engine('less', function(params, next) {
  var less = require('less');

  var prepare = function(code, locals) {
    var out = [];

    for (var key in locals) {
      if (/boolean|number|string/.test(typeof locals[key])) {
        out.push('@' + (key.charAt() === '@' ? key.substr(1) : key) + ': ~' + JSON.stringify(locals[key].toString()) + ';');
      }
    }

    return out.concat([code]).join('\n');
  };

  var compile = function() {
    return function(locals) {
      if (params.filepath) {
        params.options.syncImport = true;
        params.options.relativeUrls = true;
        params.options.paths = [params.filepath];
      }

      var parser = new less.Parser(defs_tpl('less', params.options)),
          output, vars = _.defaults({}, params.options.locals);

      parser.parse(prepare(params.source, _.defaults(vars, locals)), function(e, tree) {
        if (e) {
          throw new Error(e.message);
        }

        output = tree.toCSS();
      });

      return output;
    };
  };


  if (next('js', 'css')) {
    if ([params.next, params.ext].indexOf('css') > -1) {
      return compile()(params.options.locals);
    }

    var source = [];

    source.push('function (locals, options) { var P = new less.Parser(options), L = [], s, k;');
    source.push('for (k in locals) if (/boolean|number|string/.test(typeof locals[k]))');
    source.push('L.push("@" + k + ": ~" + JSON.stringify(locals[k].toString()) + ";");');
    source.push('P.parse(L.join("\\n") + ' + JSON.stringify(params.source));
    source.push(', function(e, T) { s = T.toCSS(); });');
    source.push('return s;}');

    return source.join('');
  }
});
