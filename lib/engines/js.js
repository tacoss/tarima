'use strict';

var babel;

module.exports = function(tarima) {
  tarima.add('js', function(params) {
    if (params.next === 'es6') {
      babel = babel || require('babel-core');

      return babel.transform(params.source, {
        filename: params.options.filename
      }).code;
    }
  });
};
