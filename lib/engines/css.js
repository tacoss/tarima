'use strict';

module.exports = function(tarima) {
  tarima.add('css', function(params, next) {
    if (next('js', 'us', 'hbs')) {
      var body = 'return ' + JSON.stringify(params.source) + ';',
          tpl = new Function('', body);

      if (!params.chain) {
        return tpl.toString();
      }

      return tpl;
    }
  });
};
