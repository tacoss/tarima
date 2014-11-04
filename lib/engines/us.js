'use strict';

var _ = require('lodash');

module.exports = function(tarima) {
  tarima.add('us', function(params) {
    var tpl = _.template(params.source, null, tarima.config('lodash', params));

    if (!params.chain) {
      return tpl.toString();
    }

    return tpl;
  });
};
