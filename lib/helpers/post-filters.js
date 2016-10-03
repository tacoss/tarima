var buildVars = require('./build-vars');

var support = require('../support');

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
      // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
      params.source = params.source.replace(/if\(window\.__VUE_WITH_STATEMENT__\)/g, 'with(this)');
    }
  }

  return filters;
};
