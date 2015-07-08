'use strict';

var $ = require('../util');

var Ractive;

module.exports = function(tarima) {
  tarima.add('ract', function(params) {
    if (!Ractive) {
      Ractive = require('ractive');
      Ractive.DEBUG = false;
    }

    if (params.next === 'js') {
      var tpl = Ractive.parse(params.source, $.configure('ractive', params)),
          body = 'return ' + JSON.stringify(tpl) + ';';

      var fn = new Function('', body);

      if (params.client) {
        return fn.toString();
      }

      return fn;
    }

    return function(locals) {
      return new Ractive({
        template: params.source,
        data: locals
      }).toHTML();
    };
  });
};
