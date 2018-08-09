'use strict';

// FIXME: replace with Object.assign()
module.exports = function $merge(target) {
  /* eslint-disable prefer-rest-params */
  const sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(source => {
    if (source) {
      Object.keys(source).forEach(k => {
        if (typeof target[k] === 'undefined') {
          target[k] = source[k];
        }
      });
    }
  });

  return target;
};
