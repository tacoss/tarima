'use strict';

var $ = require('../util');

var Ractive = require('ractive');

Ractive.DEBUG = false;

module.exports = function(tarima) {
  tarima.add('ract', function(params, next) {
    switch (next('js', 'ejs', 'hbs', 'html')) {
      case 'js':
        var tpl = Ractive.parse(params.source, $.configure('ractive', params)),
            body = 'return ' + JSON.stringify(tpl) + ';';

        if (params.client) {
          return 'function(){' + body + '}';
        }

        return new Function('', body);

      default:
        return function(locals) {
          return new Ractive({
            template: params.source,
            data: locals
          }).toHTML();
        };
    }
  });
};
