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

function render(params, cb) {
  var code;

  if (params.next === 'coffee') {
    code = fixLiterate(params.code);
  } else{
    kramed = kramed || require('kramed');

    code = kramed(params.code);
  }

  cb(null, {
    out: code
  });
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['md', 'mkd'],
  required: ['kramed'],
  render: render,
  compile: render
};
