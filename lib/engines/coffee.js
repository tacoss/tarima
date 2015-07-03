'use strict';

var $ = require('../util');

var coffee = require('coffee-script');

module.exports = function(tarima) {
  tarima.add('coffee', function(params) {
    if (params.next === 'js') {
      return coffee.compile(params.source, $.configure('coffee', params));
    }
  });
};
