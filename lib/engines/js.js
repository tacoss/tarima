'use strict';

var babel;

function compile(params) {
  babel = babel || require('babel-core');

  return babel.transform(params.source, {
    filename: params.options.filename
  }).code;
}

module.exports = function(tarima) {
  tarima.add('js', function(params) {
    if (params.next === 'es6') {
      return compile(params);
    }
  });

  tarima.add('jsx', function(params) {
    return compile(params);
  });
};
