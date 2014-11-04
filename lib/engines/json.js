'use strict';

module.exports = function(tarima) {
  tarima.add('json', function(params, next) {
    if (next('js')) {
      var tpl = new Function('', 'return ' + params.source.trim() + ';');

      if (!params.chain) {
        return tpl.toString();
      }

      return tpl;
    }
  });
};
