var tosource = require('tosource');

var reGlobal = /\/\*+\s*global\s+[\s\S]+?\s*\*+\//g,
    reGlobalValues = /\/\*+\s*global\s+([\s\S]+?)\s*\*+\//;

module.exports = function(vars) {
  var values = {};

  for (var prop in vars) {
    values[prop] = typeof vars[prop] === 'function' ? String(vars[prop]()).trim() : tosource(vars[prop]);
  }

  return function(partial) {
    var matches = partial.source.match(reGlobal);

    if (matches) {
      var seen = [],
          prelude = [];

      matches.forEach(function(comment) {
        comment.match(reGlobalValues)[1].split(/[\s,]+/)
          .forEach(function(local) {
            if (seen.indexOf(local) === -1) {
              if (values[local]) {
                prelude.push('var ' + local + ' = ' + values[local] + ';\n');
              }

              seen.push(local);
            }
          });
      });

      partial.source = prelude.join('') + partial.source.replace(reGlobal, '');
    }
  };
};
