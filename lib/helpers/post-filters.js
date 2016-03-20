var buildGlobals = require('./build-globals');

var support = require('../support');

module.exports = function(params) {
  var filters = [];

  if (params.options.globals && support.isScript(params.parts)) {
    filters.push(buildGlobals(params.options.globals));
  }

  return filters;
};
