'use strict';

var babel;

module.exports = function(tarima) {
  tarima.add('js', function(params) {
    babel = babel || require('babel-core');

    if (params.next === 'es6') {
      return babel.transform(params.source, {
        filename: params.options.filename
      }).code;
    }
  });
};
