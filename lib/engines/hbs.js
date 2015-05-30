'use strict';

var $ = require('../util');

var Handlebars = require('handlebars');

module.exports = function(tarima) {
  tarima.add('hbs', function(params) {
    var compile = function(client) {
      var method = client ? 'precompile' : 'compile',
          tpl = Handlebars[method](params.source, $.configure('handlebars', params));

      if (client) {
        return 'Handlebars.template(' + tpl.toString() + ')';
      }

      return tpl;
    };

    if (params.client) {
      return compile(true);
    }

    return compile();
  });
};
