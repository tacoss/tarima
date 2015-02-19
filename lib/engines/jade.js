'use strict';

module.exports = function(tarima) {
  tarima.add('jade', function(params, next) {
    var jade = require('jade');

    if (params.filename) {
      params.options.filename = (params.filepath ? params.filepath + '/' : '') + params.filename;
    }

    var compile = function(client) {
      var prefix = '',
          source;

      if (params.options.includes && params.options.includes.jade) {
        prefix = params.options.includes.jade.join('\n');
      }

      source = ((prefix ? prefix + '\n' : '') + params.source)
        .replace(/\n([\t\s]*)\{\{(.*?)\}\}/g, '\n$1|{{$2}}'); // those ugly pipes

      var partial = jade[client ? 'compileClient' : 'compile'](source, tarima.config('jade', params));

      return partial;
    };

    if (next('js', 'us', 'hbs', 'html', 'ract')) {
      if (!params.chain) {
        return compile(true).toString().replace(/\n{2,}/g, '\n');
      }

      return compile();
    }
  });
};
