var buildGlobals = require('./build-globals');

module.exports = function(params) {
  var filters = [];

  if (params.options.globals) {
    filters.push(buildGlobals(params.options.globals));
  }

  return filters;
};
