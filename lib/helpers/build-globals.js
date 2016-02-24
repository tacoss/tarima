var tosource = require('tosource');

module.exports = function(vars) {
  var re,
      keys = Object.keys(vars),
      values = {};

  if (keys.length) {
    re = new RegExp(keys.map(function(key) {
      return '\\b' + key + '\\b';
    }).join('|'), 'g');

    keys.forEach(function(key) {
      values[key] = tosource(vars[key]);
    });
  }

  return function(partial) {
    if (re && re.test(partial.source)) {
      var locals = [],
          context = ['this'];

      partial.source.match(re).forEach(function(key) {
        locals.push(key);
        context.push(values[key]);
      });

      partial.source = '(function(' + locals.join(',') + '){' + partial.source + '}).call(' + context.join(',') + ');';
    }
  };
};
