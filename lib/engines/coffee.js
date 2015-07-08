'use strict';

var $ = require('../util');

var coffee;

module.exports = function(tarima) {
  tarima.add('coffee', function(params) {
    coffee = coffee || require('coffee-script');

    if (params.next === 'js') {
      return coffee.compile(params.source, $.configure('coffee', params));
    }
  });
};
