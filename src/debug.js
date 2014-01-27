
var debug_tpl = function(params, view) {
  return function() {
    try {
      return 'function' === typeof view ? view.apply(null, arguments) : view;
    } catch (e) {
      throw new Error('Compilation error for ' + params.filename + ' (' + e.message + ')\n' + params.source);
    }
  };
};
