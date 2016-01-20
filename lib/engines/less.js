'use strict';

var $ = require('../util');

var path = require('path');

var less;

module.exports = function(tarima) {
  tarima.add('less', function(params) {
    var compile = function() {
      return function(locals) {
        less = less || require('less');

        var opts = $.configure('less', params),
            output = '',
            vars = {};

        $.defaults(vars, locals);

        for (var prop in vars) {
          if (typeof vars[prop] === 'object') {
            delete vars[prop];
          } else if (typeof vars[prop] === 'string') {
            vars[prop] = '~' + JSON.stringify(vars[prop]);
          }
        }

        if (params.filepath) {
          opts.paths = [params.filepath].concat(opts.paths || []);
        }

        opts.globalVars = opts.globalVars || {};

        $.defaults(opts.globalVars, vars);

        var globals = Object.keys(opts.globalVars).length;

        if (!globals) {
          delete opts.globalVars;
        }

        opts.sync = true;
        opts.syncImport = true;
        opts.filename = path.join(params.filepath, params.filename);

        less.render(params.source, opts, function(err, data) {
          if (err) {
            if (globals) {
              err.line -= globals;
              err.extract = err.extract.slice(globals);
            }

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
