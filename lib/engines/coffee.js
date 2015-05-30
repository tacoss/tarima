'use strict';

var $ = require('../util');

var coffee = require('coffee-script');

module.exports = function(tarima) {
  tarima.add('coffee', function(params, next) {
    if (next('js')) {
      var tpl = new Function('', coffee.compile(params.source, $.configure('coffee', params)));

      if (params.client) {
        return tpl.toString();
      }

      return tpl;
    }
  });
};
