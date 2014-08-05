
register_engine('js', function(params) {
  var compile = function() {
    var body, fn;

    if (!/^\s*function\b/.test(params.source)) {
      body = params.source;
    } else {
      body = 'return (' + params.source + ')()';
    }

    /* jshint evil:true */
    return new Function('', body);
  };

  return compile();
});
