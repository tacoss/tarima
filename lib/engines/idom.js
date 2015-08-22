'use strict';

var idom;

module.exports = function(tarima) {
  tarima.add('idom', function(params) {
    if (params.next === 'js') {
      idom = idom || require('itemplate');

      return [
        'function(el,data){var lib;return (lib=IncrementalDOM,lib.patch(el,',
        idom.compile(params.source, idom).toString(),
        ',data));}'
      ].join('');
    }
  });
};
