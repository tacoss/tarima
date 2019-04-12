'use strict';

const reImport = require('rewrite-imports');
const reExport = require('rewrite-exports');

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

const _args = /([^=]+)=(["'])([^"']+?)\2/g;
const _do = /<do([^<>]*)(?:\/>|>([^<>]*)<\/do>)/ig;
const _use = /("|')use strict\1;?/g;
const _tag = /\[!\[(\w+)(\s+(?:\[.*?\]|\{.*?\}|".*?"|-?\d+(?:\d+)?|true|false|null))?\]\]/g;

const quoteMap = [
  [/&quot;/g, '"'],
  [/&apos;/g, "'"],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
];

function unquote(value) {
  return quoteMap.reduce((prev, cur) => prev.replace(cur[0], cur[1]), value);
}

function processOutput(params) {
  const _prefix = params.runtimes.join('\n');

  if (_prefix) {
    params.source = `${_prefix}\n${params.source}`;
  }

  if (params.isScript) {
    if (!params._import) {
      params.source = reExport(reImport(params.source));
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
      .replace(_do, (_, args, body) => {
        const data = args.match(_args).reduce((prev, cur) => {
          try {
            const values = cur.split('=');
            const key = values.shift().trim();
            const val = JSON.parse(values.join('='));

            prev[key] = support.isJSON(val)
              ? JSON.parse(unquote(val))
              : val;
          } catch (e) {
            throw new Error(`Failed while parsing: ${_}. ${e.message}`);
          }

          return prev;
        }, {});

        data.src = !Array.isArray(data.src) ? [data.src] : data.src;
        data.body = data.body || body;

        if (!params.options.helpers[data.use]) {
          throw new Error(`Unknown tag helper: ${_}`);
        }

        return params.options.helpers[data.use](data, params);
      })
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

        return params.options.helpers[tag]({ src: !Array.isArray(args) ? [args] : args }, params);
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

    if (params._chunks) {
      params._chunks.forEach((info, key) => {
        const chunk = {
          ...params,
          source: info.code,
          sourceMap: info.map,
          filename: path.join(path.dirname(params.filename), info.name),
        };

        processOutput(chunk);
        params._chunks[key] = chunk;
      });
    }

    processOutput(params);
    cb(undefined, params);
  };
};
