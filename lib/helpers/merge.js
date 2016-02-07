module.exports = function(target) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function(source) {
    for (var k in source) {
      target[k] = source[k];
    }
  });

  return target;
};
