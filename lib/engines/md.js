var $ = require('../util');

var kramed;

// taken from coffee-script source
function fixLiterate(code) {
  var maybe_code = true,
      lines = [];

  code.split('\n').forEach(function(line) {
    if (maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
      lines.push(line);
    } else {
      maybe_code = /^\s*$/.test(line);

      if (maybe_code) {
        lines.push(line);
      } else {
        lines.push('# ' + line);
      }
    }
  });

  return lines.join('\n');
}

module.exports = function(tarima) {
  tarima.add('md', function(params) {
    if (params.next === 'coffee') {
      return fixLiterate(params.source);
    }

    kramed = kramed || require('kramed');

    var opts = {};

    $.defaults(opts, $.configure('kramed', params));

    kramed.setOptions(opts);

    return kramed(params.source);
  });
};
