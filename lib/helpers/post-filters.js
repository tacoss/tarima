/* global document */

var buildVars = require('./build-vars');

var support = require('../support');

// custom css-inliner for Vue components
var _inject = 'if (typeof window !== "undefined")'
  + ' window.__VUE_PUSH_STYLESHEET = ' + (function injectCSS(css) {
  var d = document;
  var s = d.createElement('style');
  var h = d.getElementsByTagName('head')[0];

  s.appendChild(d.createTextNode(css.join('\n')));
  h.appendChild(s);
}).toString() + ';';

module.exports = function(params) {
  var filters = [];

  if (Array.isArray(params.options.postRender)) {
    Array.prototype.push.apply(filters, params.options.postRender);
  }

  if (typeof params.options.postRender === 'function') {
    filters.push(params.options.postRender);
  }

  if (support.isScript(params.parts)) {
    var locals = {};

    if (params.options.globals) {
      Object.keys(params.options.globals).forEach(function(key) {
        locals[key] = params.options.globals[key];
      });
    }

    Object.keys(params.data).forEach(function(key) {
      locals[key] = params.data[key];
    });

    filters.push(buildVars(locals, 'global'));

    if (params.source.indexOf('__VUE_WITH_STATEMENT__') > -1) {
      params.source = (params._rollup ? _inject + '\n' : '') + params.source
        // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
        .replace(/if\(window\.__VUE_WITH_STATEMENT__\)/g, 'with(this)');

      // cleanup
      params.source += (params._rollup
        ? '\n;if (typeof window !== "undefined") delete window.__VUE_PUSH_STYLESHEET;'
        : '');
    }
  }

  return filters;
};
