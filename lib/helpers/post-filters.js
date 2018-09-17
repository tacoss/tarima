'use strict';

const path = require('path');

const merge = require('./merge');

const support = require('../support');
const buildVars = require('./build-vars');

// custom css-inliner for Vue components
const _inject = `if (typeof window !== "undefined")
  window.__PUSH_STYLESHEET = function (css) {
  var d = document;
  var s = d.createElement('style');
  var h = d.getElementsByTagName('head')[0];

  s.appendChild(d.createTextNode(css.join('')));
  h.appendChild(s);
}`;

const _use = /("|')use strict\1;?/g;
const _tag = /\[!\[(\w+)(\s+(?:\[.*?\]|\{.*?\}|".*?"|-?\d+(?:\d+)?|true|false|null))?\]\]/g;

const reImport = /^\s*import\s+(?:(.+?)\s+from\s+)?((['"])[^\2\s;]+\2)/gm;
const reExport = /^\s*export\s+((?:\w+\s+){1,3})/gm;

const reSplitAs = /\s+as\s+/;
const reProps = /(\w+)\s+as\s+(\w+)/g;
const reVars = /\s*,\s*/g;
const reCleanVars = /\{\s*\}/;

let inc = 0;

function id(str, hide) {
  inc += 1;

  return (hide ? `$_${inc}` : '') + str
    .split('/').pop()
    .replace(/\.\w+|\W/g, '');
}

function refs(str, ref) {
  const props = str.match(reProps);
  const out = [];

  if (props) {
    props.forEach(x => {
      const parts = x.split(reSplitAs);

      out.push(`${parts[1]} = ${ref}.${parts[0]}`);
    });
  }

  const vars = str.replace(reProps, '')
    .replace(reCleanVars, '').split(reVars);

  vars.forEach(x => {
    if (x && x.indexOf('{') === -1 && x.indexOf('}') === -1) {
      out.push(`${x} = (${ref}.default || ${ref})`);
    } else if (id(x)) {
      out.push(`${id(x)} = ${ref}.${id(x)}`);
    }
  });

  return out;
}

function replaceImport(_, $1, $2) {
  if (!$1) {
    return `require(${$2})`;
  }

  if ($1.indexOf(',') === -1 && $1.indexOf(' as ') === -1) {
    if ($1.indexOf('{') === -1 && $1.indexOf('}') === -1) {
      return `var ${$1.replace('*', id($2))} = require(${$2})`;
    }

    return `var ${id($1)} = require(${$2}).${id($1)}`;
  }

  if ($1.indexOf('* as ') === -1) {
    const ref = id($2, true);

    return `var ${ref} = require(${$2}), ${refs($1, ref).join(', ')}`;
  }

  return `var ${$1.replace('* as ', '')} = require(${$2})`;
}

function replaceExport(_, words) {
  words = words.trim().split(/\s+/);

  let prefix = 'module.exports';

  if (words[0] === 'default') {
    prefix = `${prefix} = ${words.slice(1).join(' ')} `;
  } else {
    prefix += `.${words[0]} = ${words.slice(1).join(' ')} `;
  }

  return prefix;
}

function processOutput(params) {
  const _prefix = params.runtimes.join('\n');

  if (_prefix) {
    params.source = `${_prefix}\n${params.source}`;
  }

  if (params.isScript) {
    if (!params._import) {
      params.source = params.source
        .replace(reImport, replaceImport)
        .replace(reExport, replaceExport);
    }

    if (params.options.strict !== true) {
      params.source = params.source.replace(_use, '');
    }

    if (params.source.indexOf('__VUE_WITH_STATEMENT__') > -1) {
      const _styles = params.source.indexOf('__PUSH_STYLESHEET') > -1;

      params.source = (_styles ? `${_inject}\n` : '') + params.source
        // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
        .replace(/if\(window\.__VUE_WITH_STATEMENT__\)/g, 'with(this)');

      // cleanup
      params.source += (_styles ? '\n;if (typeof window !== "undefined") delete window.__PUSH_STYLESHEET;' : '');
    }

    params.source = buildVars(params.source, merge({}, params.options.globals, params.data));

    if ((params.options.sourceMaps || params.options.compileDebug)
      && params.sourceMap && params.source.indexOf('sourceMappingURL') === -1) {
      params.source += `\n//# sourceMappingURL=${support.toUrl(params.sourceMap)}`;
    }
  } else {
    // custom tag-helpers
    params.source = params.source
      .replace(_tag, (_, tag, value) => {
        let args;

        try {
          args = value ? JSON.parse(value) : [];
        } catch (e) {
          throw new Error(`Unable to parse: ${_}`);
        }

        if (!params.options.helpers[tag]) {
          throw new Error(`Unknown tag helper: ${_}`);
        }

        return params.options.helpers[tag]
          .apply(null, !Array.isArray(args) ? [args] : args);
      });

    if ((params.options.sourceMaps || params.options.compileDebug)
      && params.sourceMap && params.source.indexOf('sourceMappingURL') === -1) {
      params.source += `\n/*# sourceMappingURL=${support.toUrl(params.sourceMap)}*/`;
    }
  }
}

module.exports = (params, cb) => {
  return err => {
    if (err) {
      return cb(err);
    }

    if (!params.source) {
      cb(new Error(`Empty source from '${params.filename}'`));
    }

    if (typeof params.source === 'object') {
      const _id = `${params.name}.${params.extension}`;

      params.chunks = {};

      Object.keys(params.source).forEach(key => {
        const chunk = {
          ...params,
          chunks: false,
          source: params.source[key],
          sourceMap: params.sourceMap[key],
          filename: path.join(path.dirname(params.filename), key),
        };

        if (_id !== key) {
          processOutput(chunk);
        }

        params.chunks[key] = chunk;
      });

      params.source = params.chunks[_id].source;
      params.sourceMap = params.chunks[_id].sourceMap;

      delete params.chunks[_id];
    }

    processOutput(params);
    cb(undefined, params);
  };
};
