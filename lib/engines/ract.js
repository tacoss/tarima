'use strict';

module.exports = function(tarima) {
  tarima.add('ract', function(params, next) {
    var Ractive = require('ractive');

    Ractive.DEBUG = false;

    switch (next('js', 'ejs', 'hbs', 'html')) {
      case 'js':
        var tpl = Ractive.parse(params.source, tarima.config('ractive', params)),
            body = 'return ' + JSON.stringify(tpl) + ';';

        if (!params.chain) {
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
