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
    if (params.options.globals) {
      filters.push(buildVars(params.options.globals, 'global'));
    }

    filters.push(buildVars(params.data, 'local'));
  }

  return filters;
};
