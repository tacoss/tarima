var $ = require('../util');

var styl;

module.exports = function(tarima) {
  tarima.add('styl', function(params) {
    styl = styl || require('styl');

    return styl(params.source, $.configure('styl', params)).toString();
  });
};
