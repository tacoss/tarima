'use strict';

var $ = require('../util');

var jade = require('jade');

module.exports = function(tarima) {
  tarima.add('jade', function(params) {
    if (params.filename) {
      params.options.filename = (params.filepath ? params.filepath + '/' : '') + params.filename;
    }

    var compile = function(client) {
      var prefix = '',
          source;

      if (params.options.includes && params.options.includes.jade) {
        prefix = params.options.includes.jade.join('\n');
      }

      source = (prefix ? prefix + '\n' : '') + params.source;

      var partial = jade[client ? 'compileClient' : 'compile'](source, $.configure('jade', params));

      return partial;
    };

    if (params.client) {
      return compile(true).replace(/\n{2,}/g, '\n');
    }

    return compile();
  });
};
