var tosource = require('tosource');

function makeRe(key) {
  return {
    decl: new RegExp('\\\/\\*+\\s*' + key + '\\s+[\\s\\S]+?\\s*\\*+\\\/', 'g'),
    vals: new RegExp('\\\/\\*+\\s*' + key + '\\s+([\\s\\S]+?)\\s*\\*+\\\/')
  };
}

module.exports = function(vars, key) {
  var values = {};

  for (var prop in vars) {
    values[prop] = typeof vars[prop] === 'function' ? String(vars[prop]()).trim() : tosource(vars[prop]);
  }

  var regexp = makeRe(key);

  return function(partial) {
    var matches = partial.source.match(regexp.decl);

    if (matches) {
      var seen = [],
          prelude = [];

      matches.forEach(function(comment) {
        comment.match(regexp.vals)[1].split(/[\s,]+/)
          .forEach(function(local) {
            if (seen.indexOf(local) === -1) {
              if (values[local]) {
                prelude.push('var ' + local + ' = ' + values[local] + ';\n');
              }

              seen.push(local);
            }
          });
      });

      partial.source = prelude.join('') + partial.source.replace(regexp.decl, '');
    }
  };
};
