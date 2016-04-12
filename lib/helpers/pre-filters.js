module.exports = function(params) {
  var filters = [];

  if (Array.isArray(params.options.filter)) {
    Array.prototype.push.apply(filters, params.options.filter);
  }

  if (typeof params.options.filter === 'function') {
    filters.push(params.options.filter);
  }

  return filters;
};
