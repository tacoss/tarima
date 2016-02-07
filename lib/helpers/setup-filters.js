var fmFilter = require('./front-matter');

module.exports = function(params) {
  var filters = [fmFilter];

  if (Array.isArray(params.options.filter)) {
    Array.prototype.push.apply(filters, params.options.filter);
  }

  if (typeof params.options.filter === 'function') {
    filters.push(params.options.filter);
  }

  delete params.options.filter;

  return filters;
};
