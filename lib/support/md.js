var $ = require('../helpers/resolve');

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

function render(params) {
  if (params.next === 'coffee') {
    params.source = fixLiterate(params.source);
  } else{
    kramed = kramed || require($('kramed'));

    params.source = kramed(params.source);
  }
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['md', 'mkd'],
  requires: ['kramed'],
  render: render,
  compile: render
};
