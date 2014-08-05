
register_engine('html', function(params, next) {
  switch (next('js', 'us', 'hbs', 'ract')) {
    case 'js':
      /* jshint evil:true */
      var body = 'return ' + JSON.stringify(params.source) + ';',
          fn = new Function('', body);

      return fn;

    default:
      return params.source;
  }
});
