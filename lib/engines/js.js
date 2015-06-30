'use strict';

var babel = require('babel-core');

module.exports = function(tarima) {
  tarima.add('js', function(params, next) {
    if (next('es6')) {
      return babel.transform(params.source, {
        filename: params.options.filename
      }).code;
    }

    return params.source;
  });

  tarima.add('es6');
};
