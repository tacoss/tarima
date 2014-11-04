'use strict';

var _ = require('lodash');

module.exports = function(tarima) {
  tarima.add('less', function(params, next) {
    var less = require('less');

    var prefix = '';

    if (params.options.includes && params.options.includes.less) {
      prefix = params.options.includes.less.join('\n');
    }

    var prepare = function(code, locals) {
      var out = [];

      for (var key in locals) {
        if (/boolean|number|string/.test(typeof locals[key])) {
          out.push('@' + (key.charAt() === '@' ? key.substr(1) : key) + ': ~' + JSON.stringify(locals[key].toString()) + ';');
        }
      }

      return out.concat([prefix, code]).join('\n');
    };

    var compile = function() {
      return function(locals) {
        if (params.filepath) {
          params.options.syncImport = true;
          params.options.paths = [params.filepath];
        }

        var output = '',
            parser = new less.Parser(tarima.config('less', params)),
            vars = _.defaults({}, params.options.locals);

        parser.parse(prepare(params.source, _.defaults(vars, locals)), function(e, tree) {
          if (e) {
            throw new Error(e.message);
          }

          output = tree.toCSS();
        });

        return output;
      };
    };

    switch (next('js', 'us', 'hbs', 'css')) {
      case 'js':
        if (params.chain) {
          return compile();
        }

        var source = [];

        source.push('function (locals, options) { var P = new less.Parser(options), L = [], s, k;');
        source.push('for (k in locals) if (/boolean|number|string/.test(typeof locals[k]))');
        source.push('L.push("@" + k + ": ~" + JSON.stringify(locals[k].toString()) + ";");');
        source.push('P.parse(L.join("\\n") + ' + JSON.stringify(prefix + '\n' + params.source));
        source.push(', function(e, T) { s = T.toCSS(); });');
        source.push('return s;}');

        return source.join('');

      default:
        return compile();
    }
  });
};
