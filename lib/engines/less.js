'use strict';

var $ = require('../util');

var less;

module.exports = function(tarima) {
  tarima.add('less', function(params) {
    var compile = function() {
      return function(locals) {
        less = less || require('less');

        if (params.filepath) {
          params.options.syncImport = true;
          params.options.paths = [params.filepath];
        }

        var opts = $.configure('less', params),
            output = '';

        opts.globalVars = locals;

        less.render(params.source, opts, function(err, data) {
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
      source.push('less.render(' + JSON.stringify(params.source));
      source.push(', { async: false, globalVars: locals }, function(err, data) {');
      source.push('if (err) throw err; s = data.css || data; });');
      source.push('return s;}');

      return source.join('');
    }

    return compile();
  });
};
