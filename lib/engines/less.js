'use strict';

var $ = require('../util');

var less = require('less');

module.exports = function(tarima) {
  tarima.add('less', function(params, next) {
    var prefix = '';

    if (params.options.includes && params.options.includes.less) {
      prefix = params.options.includes.less.join('\n');
    }

    var prepare = function(locals) {
      var data = {};

      for (var key in locals) {
        if (/boolean|number|string/.test(typeof locals[key])) {
          data[key] = '~' + JSON.stringify(locals[key].toString());
        }
      }

      return data;
    };

    var compile = function() {
      return function(locals) {
        if (params.filepath) {
          params.options.syncImport = true;
          params.options.paths = [params.filepath];
        }

        var opts = $.configure('less', params),
            output = '';

        opts.globalVars = prepare($.merge({}, params.options.locals, locals));

        less.render(prefix + '\n' + params.source, opts, function(err, data) {
          if (err) {
            throw err;
          }

          output = data.css;
        });

        return output;
      };
    };

    switch (next('js', 'ejs', 'hbs', 'css')) {
      case 'js':
        if (!params.client) {
          return compile();
        }

        var source = [];

        source.push('function (locals) { var s;');
        source.push('less.render(' + JSON.stringify(prefix + '\n' + params.source));
        source.push(', { async: false, globalVars: (' + prepare.toString().replace(/\s+/g, ' ') + ')(locals) }');
        source.push(', function(err, data) { if (err) throw err; s = data.css || data; });');
        source.push('return s;}');

        return source.join('');

      default:
        return compile();
    }
  });
};
