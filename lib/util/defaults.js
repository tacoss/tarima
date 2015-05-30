'use strict';

module.exports = function(dest, src) {
  for (var key in src) {
    if (typeof dest[key] === 'undefined') {
      dest[key] = src[key];
    }
  }
};
