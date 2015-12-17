var $ = require('../util');

var imba;

module.exports = function(tarima) {
  tarima.add('imba', function(params) {
    if (params.next === 'js') {
      imba = imba || require('imba/compiler');

      return imba.compile(params.source, $.configure('imba', params)).toString();
    }
  });
};
