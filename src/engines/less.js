
register_engine('less', function(params, less) {
  var prepare = function(code, locals) {
    var out = [];

    for (var key in locals) {
      if (/boolean|number|string/.test(typeof locals[key])) {
        out.push('@' + (key.charAt() === '@' ? key.substr(1) : key) + ': ~' + JSON.stringify(locals[key].toString()) + ';');
      }
    }

    return out.concat([code]).join('\n');
  };

  var compile = function(client) {
    var css, source = [];

    if (client) {
      less.render(prepare(params.source, params.options.locals), function(e, tree) {
        if (e) {
          throw new Error(e.message);
        }

        css = tree.toCSS();
      });

      return css;
    }

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


  if ('js' === params.next) {
    var source = [];

    source.push('function (locals, options) { var P = new less.Parser(options), L = [], s, k;');
    source.push('for (k in locals) if (/boolean|number|string/.test(typeof locals[k]))');
    source.push('L.push("@" + k + ": ~" + JSON.stringify(locals[k].toString()) + ";");');
    source.push('P.parse(L.join("\\n") + ' + JSON.stringify(params.source));
    source.push(', function(e, T) { s = T.toCSS(); });');
    source.push('return s;}');

    return source.join('');
  }

  if ('css' === params.next || 'css' === params.ext) {
    return compile()(params.options.locals);
  }

  if (!params.next) {
    return compile();
  }

  return params.source;
}, require('less'));
