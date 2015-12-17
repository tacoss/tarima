var $ = require('../util');

var Handlebars;

module.exports = function(tarima) {
  tarima.add('hbs', function(params) {
    Handlebars = Handlebars || require('handlebars');

    var compile = function(client) {
      var method = client ? 'precompile' : 'compile',
          tpl = Handlebars[method](params.source, $.configure('handlebars', params));

      if (client) {
        return 'Handlebars.template(' + tpl.toString() + ')';
      }

      return tpl;
    };

    if (params.next === 'js' && params.client) {
      return compile(true);
    }

    return compile();
  });
};
