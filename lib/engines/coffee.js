var $ = require('../util');

var path = require('path');

var coffee;

module.exports = function(tarima) {
  tarima.add('coffee', function(params) {
    if (params.next === 'js') {
      coffee = coffee || require('coffee-script');

      var options = $.configure('coffee', params);

      options.filename = path.join(params.filepath, params.filename);

      return coffee.compile(params.source, options);
    }
  });
};
