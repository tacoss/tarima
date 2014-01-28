
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


  switch (params.next) {
    case 'js':
      return compile().toString();
  }

  if (!params.next) {
    return compile(!params.call);
  }

  return params.source;
});
