'use strict';

var $ = require('../util');

var jade = require('jade'),
    path = require('path');

module.exports = function(tarima) {
  tarima.add('jade', function(params) {
    if (params.filepath) {
      params.options.filename = path.join(params.filepath, params.filename);
    }

    var compile = function(client) {
      return jade[client ? 'compileClient' : 'compile'](params.source, $.configure('jade', params));
    };

    if (params.next === 'js' && params.client) {
      return compile(true).replace(/\n{2,}/g, '\n');
    }

    return compile();
  });
};
