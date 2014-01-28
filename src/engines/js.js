
register_engine('js', function(params) {
  var compile = function() {
    var body, fn;

    if (!/^\s*function\s*[\w\s]*(?=\(\s*[$a-zA-Z_])/.test(params.source)) {
      body = 'with(locals_||{}){' + params.source + '}';
    } else {
      body = 'return (' + params.source + ')(_locals)';
    }

    /* jshint evil:true */
    return new Function('locals_', body);
  };


  if (!params.next && !params.call) {
    return compile();
  }

  if ('js' === params.next) {
    return compile().toString();
  }

  return params.source;
});
