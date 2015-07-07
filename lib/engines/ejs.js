'use strict';

var $ = require('../util');

var ejs = require('ejs'),
    path = require('path');

module.exports = function(tarima) {
  tarima.add('ejs', function(params) {
    function compile(client) {
      if (params.filepath) {
        params.options.filename = path.join(params.filepath, params.filename);
      }

      params.options.client = !!client;

      return ejs.compile(params.source, $.configure('ejs', params));
    }

    if (params.next === 'js' && params.client) {
      return compile(true).toString();
    }

    return compile();
  });
};
