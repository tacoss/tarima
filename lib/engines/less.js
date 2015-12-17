'use strict';

var $ = require('../util');

var less;

module.exports = function(tarima) {
  tarima.add('less', function(params) {
    var compile = function() {
      return function(locals) {
        less = less || require('less');

        var opts = $.configure('less', params),
            output = '';

        opts.globalVars = opts.globalVars || {};

        $.defaults(opts.globalVars, locals);

        for (var prop in opts.globalVars) {
          if (typeof opts.globalVars[prop] === 'object') {
            delete opts.globalVars[prop];
          }
        }

        if (params.filepath) {
          opts.syncImport = true;
          opts.paths = [params.filepath].concat(opts.paths || []);
        }

        less.render(params.source, opts, function(err, data) {
          if (err) {
            throw err;
          }

          output = data.css;

          params.required = data.imports;
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
