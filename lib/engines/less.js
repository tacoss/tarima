'use strict';

var $ = require('../util');

var less = require('less');

module.exports = function(tarima) {
  tarima.add('less', function(params) {
    var prefix = '';

    if (params.options.includes && params.options.includes.less) {
      prefix = params.options.includes.less.join('\n');
    }

    var compile = function() {
      return function(locals) {
        if (params.filepath) {
          params.options.syncImport = true;
          params.options.paths = [params.filepath];
        }

        var opts = $.configure('less', params),
            output = '';

        opts.globalVars = locals;

        less.render(prefix + '\n' + params.source, opts, function(err, data) {
          if (err) {
            throw err;
          }

          output = data.css;
        });

        return output;
      };
    };

    if (params.next === 'js' && params.client) {
      var source = [];

      source.push('function (locals) { var s;');
      source.push('less.render(' + JSON.stringify(prefix + '\n' + params.source));
      source.push(', { async: false, globalVars: locals }, function(err, data) {');
      source.push('if (err) throw err; s = data.css || data; });');
      source.push('return s;}');

      return source.join('');
    }

    return compile();
  });
};
