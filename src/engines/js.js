
register_engine('js', function(params) {
  var compile = function(exec) {
    var body, fn;

    if (!/^\s*function\s*[\w\s]*(?=\(\s*[$a-zA-Z_])/g.test(params.source)) {
      body = 'with(locals_||{}){' + params.source + '}';
    } else {
      body = 'return (' + params.source + ')(locals_);';
    }

    /* jshint evil:true */
    fn = new Function('locals_', body);
    fn = exec ? fn : fn.toString();

    return fn;
  };

  return compile(!params.next && params.call);
});
