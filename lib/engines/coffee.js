var $ = require('../util');

var coffee;

module.exports = function(tarima) {
  tarima.add('coffee', function(params) {
    if (params.next === 'js') {
      coffee = coffee || require('coffee-script');

      return coffee.compile(params.source, $.configure('coffee', params));
    }
  });
};
