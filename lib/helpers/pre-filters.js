module.exports = function(params) {
  var filters = [];

  if (params.options.extensions) {
    var ext = params.parts[0];

    if (params.options.extensions[ext]) {
      var fixedExts = params.options.extensions[ext];

      fixedExts = Array.isArray(fixedExts) ? fixedExts : [fixedExts];

      Array.prototype.unshift.apply(params.parts, fixedExts.slice().reverse());
    }
  }

  if (Array.isArray(params.options.preRender)) {
    Array.prototype.push.apply(filters, params.options.preRender);
  }

  if (typeof params.options.preRender === 'function') {
    filters.push(params.options.preRender);
  }

  return filters;
};
