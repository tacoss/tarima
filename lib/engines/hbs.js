'use strict';

module.exports = function(tarima) {
  tarima.add('hbs', function(params) {
    var Handlebars = require('handlebars');

    var compile = function(client) {
      var method = client ? 'precompile' : 'compile',
          tpl = Handlebars[method](params.source, tarima.config('handlebars', params));

      if (client) {
        return 'Handlebars.template(' + tpl.toString() + ')';
      }

      return tpl;
    };

    if (!params.chain) {
      return compile(true);
    }

    return compile();
  });
};
