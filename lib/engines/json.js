'use strict';

module.exports = function(tarima) {
  tarima.add('json', function(params) {
    if (params.next === 'js') {
      var tpl = new Function('', 'return ' + params.source.trim() + ';');

      if (params.client) {
        return tpl.toString();
      }

      return tpl;
    }
  });
};
