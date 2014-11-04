'use strict';

module.exports = function(tarima) {
  tarima.add('coffee', function(params, next) {
    var coffee = require('coffee-script');

    if (next('js')) {
      var tpl = new Function('', coffee.compile(params.source, tarima.config('coffee', params)));

      if (!params.chain) {
        return tpl.toString();
      }

      return tpl;
    }
  });
};
