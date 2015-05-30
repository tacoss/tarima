'use strict';

module.exports = function(obj) {
  Array.prototype.slice.call(arguments, 1)
    .forEach(function(src) {
      for (var key in src) {
        obj[key] = typeof src[key] !== 'undefined' ? src[key] : obj[key];
      }
    });

  return obj;
};
