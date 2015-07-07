'use strict';

var $ = require('../util');

var ejs = require('ejs');

module.exports = function(tarima) {
  tarima.add('ejs', function(params) {
    function compile(client) {
      if (params.filepath) {
        params.options.filename = params.filepath;
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
