'use strict';

var _ = require('lodash');

module.exports = function(tarima) {
  tarima.add('less', function(params, next) {
    var less = require('less');

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

        var opts = tarima.config('less', params),
            output = '';

        opts.globalVars = _.defaults(_.defaults({}, params.options.locals), locals);

        less.render(prefix + '\n' + params.source, opts, function(err, data) {
          if (err) {
            throw err;
          }

          output = data.css;
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

        source.push('function (locals, options) { var s;');
        source.push('less.render(' + JSON.stringify(prefix + '\n' + params.source) + ', options)');
        source.push('.then(function(output) { s = output.css; })');
        source.push('return s;}');

        return source.join('');

      default:
        return compile();
    }
  });
};
