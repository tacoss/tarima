var tosource = require('tosource');

module.exports = function(vars) {
  var re,
      keys = Object.keys(vars),
      values = {};

  if (keys.length) {
    var regex = new RegExp(keys.map(function(key) {
          return '\\b' + key + '\\b';
        }).join('|'), 'g');

    keys.forEach(function(key) {
      values[key] = tosource(vars[key]);
    });
  }

  return function(partial) {
    if (re && re.test(partial.code)) {
      var locals = [],
          context = ['this'];

      partial.code.match(re).forEach(function(key) {
        locals.push(key);
        context.push(values[key]);
      });

      partial.code = '(function(' + locals.join(',') + '){' + partial.code + '}).call(' + context.join(',') + ');';
    }
  };
};
