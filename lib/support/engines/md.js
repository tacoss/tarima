'use strict';

const merge = require('../../helpers/merge');

const rePreCode = /<pre>(\s*<code class="lang-\w+">)/g;

// taken from coffee-script source
function fixLiterate(code) {
  let maybeCode = true;

  const lines = [];

  code.split('\n').forEach(line => {
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

function render(params, cb) {
  if (params.next === 'coffee') {
    params.source = fixLiterate(params.source);
  } else {
    const opts = merge({}, params.options.kramed || {});

    const kramed = this.kramed;

    const hi = typeof opts.highlight === 'string'
      ? opts.highlight
      : 'highlight.js';

    let className = '';

    if (opts.highlight && typeof opts.highlight !== 'function') {
      opts.highlight = (code, lang, end) => {
        try {
          switch (hi) {
            case 'pygmentize-bundled':
              this.pygmentizeBundled({ lang, format: 'html' }, code, (err, result) => {
                end(err, result.toString());
              });
              break;

            case 'rainbow-code':
              end(null, this.rainbowCode.colorSync(code, lang));
              break;

            case 'highlight.js':
              className = 'hljs';
              end(null, !lang
                ? this.highlightJs.highlightAuto(code).value
                : this.highlightJs.highlight(lang, code).value);
              break;

            default:
              end(new Error(`Unsupported highlighter: ${hi}`));
          }
        } catch (e) {
          end(e);
        }
      };
    }

    kramed(params.source, opts, (err, content) => {
      if (!err) {
        if (className) {
          params.source = content.replace(rePreCode, `<pre class="${className}">$1`);
        } else {
          params.source = content;
        }
      }

      cb(err
        ? new Error(`Unable to run ${hi}: ${err.message || err.toString()}`)
        : null);
    });
  }
}

module.exports = {
  render,
  ext: 'html',
  support: ['md', 'mkd'],
  requires: ['kramed', 'pygmentize-bundled', 'rainbow-code', 'highlight.js'],
};
