module.exports = function(obj) {
  var target = {};

  for (var key in obj) {
    target[key] = obj[key];
  }

  return target;
};
