var buildGlobals = require('./build-globals');

var support = require('../support');

module.exports = function(params) {
  var filters = [];

  if (params.options.globals && support.isScript(params.parts)) {
    filters.push(buildGlobals(params.options.globals));
  }

  if (Array.isArray(params.options.postRender)) {
    Array.prototype.push.apply(filters, params.options.postRender);
  }

  if (typeof params.options.postRender === 'function') {
    filters.push(params.options.postRender);
  }

  return filters;
};
