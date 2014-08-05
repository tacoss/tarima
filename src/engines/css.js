
register_engine('css', function(params, next) {
  if (next('js', 'us', 'hbs')) {
    /* jshint evil:true */
    var body = 'return ' + JSON.stringify(params.source) + ';',
        fn = new Function('', body);

    return fn;
  }
});
