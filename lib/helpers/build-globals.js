var tosource = require('tosource');

var reGlobal = /\/\*+\s*global\s+[\s\S]+?\s*\*+\//g,
    reGlobalValues = /\/\*+\s*global\s+([\s\S]+?)\s*\*+\//;

module.exports = function(vars) {
  var values = {};

  for (var prop in vars) {
    var value = vars[prop];

    values[prop] = value.indexOf('function') === -1 ? tosource(value) : value;
  }

  return function(partial) {
    var matches = partial.source.match(reGlobal);

    if (matches) {
      var foundGlobals = matches.map(function(comment) {
        return comment.match(reGlobalValues)[1];
      });

      var seen = {},
          prelude = [];

      for (var prop in foundGlobals) {
        prop = foundGlobals[prop];

        if (!seen[prop] && values[prop]) {
          prelude.push('var ' + prop + ' = ' + values[prop]);
          seen[prop] = 1;
        }
      }

      partial.source = prelude.join('\n') + partial.source;
    }
  };
};
