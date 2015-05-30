'use strict';

module.exports = function(tarima) {
  tarima.add('css', function(params, next) {
    if (next('js', 'ejs', 'hbs')) {
      var body = 'return ' + JSON.stringify(params.source) + ';',
          tpl = new Function('', body);

      if (params.client) {
        return tpl.toString();
      }

      return tpl;
    }
  });
};
