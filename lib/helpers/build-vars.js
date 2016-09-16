var tosource = require('tosource');

function makeRe(key) {
  return new RegExp('\\\/\\*+\\s*' + key + '\\s+([\\s\\S]+?)\\s*\\*+\\\/', 'g');
}

module.exports = function(vars, key) {
  var values = {};

  for (var prop in vars) {
    values[prop] = typeof vars[prop] === 'function' ? String(vars[prop]()).trim() : tosource(vars[prop]);
  }

  var regexp = makeRe(key);

  return function(partial) {
    partial.source = partial.source.replace(regexp, function(_, key) {
      var out = [];

      key.split(/[\s,]+/).forEach(function(k) {
        if (typeof values[k] !== 'undefined') {
          out.push(k + ' = ' + values[k]);
        }
      });

      return out.length ? 'var ' + out.join(',\n') + ';\n' : '';
    });
  };
};
