var $ = require('../util');

var jisp;

module.exports = function(tarima) {
  tarima.add('jisp', function(params) {
    if (params.next === 'js') {
      jisp = jisp || require('jisp');

      return jisp.compile(params.source, $.configure('jisp', params));
    }
  });
};
