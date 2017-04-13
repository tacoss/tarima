'use strict';

const merge = require('./merge');

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
const _tag = /<@(\w+)(\s+(?:\[.*?\]|\{.*?\}|".*?"|-?\d+(?:\d+)?|true|false|null))?>/g;

module.exports = (params, cb) => {
  return err => {
    if (err) {
      return cb(err);
    }

    const _prefix = params.runtimes.join('\n');

    if (_prefix) {
      params.source = `${_prefix}\n${params.source}`;
    }

    if (params.isScript) {
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
    }

    cb(undefined, params);
  };
};
