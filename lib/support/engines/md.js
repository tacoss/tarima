'use strict';

// taken from coffee-script source
function fixLiterate(code) {
  let maybeCode = true;

  const lines = [];

  code.split('\n').forEach((line) => {
    if (maybeCode && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
      lines.push(line);
    } else {
      maybeCode = /^\s*$/.test(line);

      if (maybeCode) {
        lines.push(line);
      } else {
        lines.push(`# ${line}`);
      }
    }
  });

  return lines.join('\n');
}

function render(params) {
  if (params.next === 'coffee') {
    params.source = fixLiterate(params.source);
  } else {
    params.source = this.kramed(params.source);
  }
}

module.exports = {
  render,
  ext: 'html',
  type: 'template',
  support: ['md', 'mkd'],
  requires: ['kramed'],
};
