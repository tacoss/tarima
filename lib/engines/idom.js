'use strict';

var idom;

module.exports = function(tarima) {
  tarima.add('idom', function(params) {
    if (params.next === 'js') {
      idom = idom || require('idom-template');

      return [
        'function(data,el){var lib;return (lib=IncrementalDOM,lib.patch(',
        'el||document.body,', idom.compile(params.source, idom).toString(),
        ',data));}'
      ].join('');
    }
  });
};
