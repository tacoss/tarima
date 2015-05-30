'use strict';

var ejs = require('ejs');

module.exports = function(tarima) {
  tarima.add('ejs', function(params) {
    function compile(client) {
      params.client = !!client;

      return ejs.compile(params.source, tarima.config('ejs', params));
    }

    if (!params.chain) {
      return compile(true);
    }

    return compile();
  });
};
