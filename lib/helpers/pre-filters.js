module.exports = function(params) {
  var filters = [];

  if (params.options.extensions) {
    var ext = params.parts[0];

    if (params.parts.length === 1 && params.options.extensions[ext]) {
      params.parts.unshift(params.options.extensions[ext]);
    }
  }

  if (Array.isArray(params.options.filter)) {
    Array.prototype.push.apply(filters, params.options.filter);
  }

  if (typeof params.options.filter === 'function') {
    filters.push(params.options.filter);
  }

  return filters;
};
