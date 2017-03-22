module.exports = function(target) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function(source) {
    for (var k in source) {
      if (Object.prototype.hasOwnProperty.call(source, k)
        && typeof target[k] === 'undefined') {
        target[k] = source[k];
      }
    }
  });

  return target;
};
