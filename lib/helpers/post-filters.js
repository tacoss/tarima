var buildVars = require('./build-vars');

var support = require('../support');

module.exports = function(params) {
  var filters = [];

  if (support.isScript(params.parts)) {
    if (params.options.globals) {
      filters.push(buildVars(params.options.globals, 'global'));
    }

    if (params.options.locals) {
      filters.push(buildVars(params.options.locals, 'local'));
    }
  }

  if (Array.isArray(params.options.postRender)) {
    Array.prototype.push.apply(filters, params.options.postRender);
  }

  if (typeof params.options.postRender === 'function') {
    filters.push(params.options.postRender);
  }

  return filters;
};
