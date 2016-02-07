var tosource = require('tosource');

function buildGlobals(vars) {
  var keys = Object.keys(vars),
      values = {};

  var regex = new RegExp(keys.map(function(key) {
      return '\\b' + key + '\\b';
    }).join('|'), 'g');

  keys.forEach(function(key) {
    values[key] = tosource(vars[key]);
  });

  return function(partial) {
    if (regex.test(partial.code)) {
      var locals = [],
          context = ['this'];

      partial.code.match(regex).forEach(function(key) {
        locals.push(key);
        context.push(values[key]);
      });

      partial.code = '(function(' + locals.join(',') + '){' + partial.code + '}).call(' + context.join(',') + ');';
    }
  };
}

module.exports = function(params) {
  var filters = [];

  if (params.options.globals) {
    filters.push(buildGlobals(params.options.globals));
  }

  return filters;
};
