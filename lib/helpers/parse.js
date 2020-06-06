'use strict';

const redent = require('redent');
const path = require('path');

const load = require('./load');
const support = require('../support');

const RE_MACROS = /(?:#|<!--|\/[/*])\s*(IF(?:_?NOT)?)\s+([\s\S]*?)(?:#|<!--|\/[/*])\s*ENDIF/;

function replaceMacro(text, flags) {
  const ifRegex = /^\s*(?:#|<!--|\/[/*])\s*IF/;
  const endRegex = /^\s*(?:#|<!--|\/[/*])\s*ENDIF/;
  const getValuesRegex = /\s*(?:#|<!--|\/[/*])\s*IF(_?NOT)?\s+([a-zA-Z_]+)/;

  const lines = text.split('\n');

  let startFound = 0;
  let endFound = 0;

  for (let i = 0; i <= lines.length; i += 1) {
    if (ifRegex.test(lines[i])) startFound = i;
    if (endRegex.test(lines[i])) {
      endFound = i;
      break;
    }
  }

  const startMatch = getValuesRegex.exec(lines[startFound]);
  const flag = flags[startMatch[2]] === 'true';
  const keepBlock = startMatch[1] ? !flag : flag;

  if (keepBlock) {
    lines.splice(startFound, 1);
    lines.splice(endFound - 1, 1);
  } else {
    lines.splice(startFound, endFound - startFound + 1);
  }

  return lines.join('\n');
}

function replaceMacros(text, flags) {
  while (RE_MACROS.test(text)) text = replaceMacro(text, flags);
  return text;
}

module.exports = (filename, source, opts) => {
  if (source.charAt(0) === '\uFEFF') {
    source = source.slice(1);
  }

  const options = opts || {};

  const dirname = path.dirname(filename);
  const src = path.basename(filename);
  const parts = src.split('.');
  const delims = Array.isArray(options.delims) ? options.delims : [options.delims || '---'];

  const start = source.indexOf(`${delims[0]}\n`);
  const end = source.indexOf(`${delims[1] || delims[0]}\n`, start + delims[0].length);

  let fm;
  let data;

  const name = parts.shift();
  const exts = options.extensions || {};
  const hasMkd = support.hasMarkdown(parts);

  if (parts.length === 1 && exts[parts[0]]) {
    Array.prototype.unshift.call(parts, exts[parts[0]]);
  }

  // replace macros before parsing front-matter
  source = replaceMacros(source, options.globals);

  // extract front-matter
  const ls = source.substr(start - 1, 1);
  const rs = source.substr(end - 1, 1);

  if ((end > start && start >= 0) && (ls === ' ' || ls === '\n' || ls === '') && (rs === ' ' || rs === '\n' || rs === '')) {
    let error;

    const slen = delims[0].length;
    const elen = (delims[1] || delims[0]).length;

    try {
      const raw = source.substr(start + slen + 1, end - (start + elen + 1));

      fm = load(filename, redent(raw));

      // cleanup
      fm.clr = () => {
        // fill with blank lines to help source-maps tools
        if (!fm._fixed) {
          fm._fixed = `${source.substr(0, start)}${
            new Array(raw.split('\n').length + 1).join('\n')
          }${source.substr(end + elen)}`;
        }

        return fm._fixed;
      };

      // strip front-matter for non-markdown sources
      if (!hasMkd || options.frontMatter === false) {
        source = fm.clr();
      }

      data = fm.obj;
    } catch (e) {
      error = e;
    }

    if (error) {
      error.message = error.reason;
      error.filename = filename;
      delete error.mark;
      throw error;
    }
  }

  if (hasMkd && data && data.$render) {
    source = fm.clr();
  }

  return {
    filename,
    dirname,
    options,
    source,
    parts,
    name,
    data: data || {},
    deps: fm ? fm.src : [],
    isScript: support.hasScripting(parts),
  };
};
