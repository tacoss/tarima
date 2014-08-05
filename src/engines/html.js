
register_engine('html', function(params, next) {
  switch (next('js', 'us', 'hbs', 'ract')) {
    case 'js':
      /* jshint evil:true */
      var body = 'return ' + JSON.stringify(params.source) + ';',
          tpl = new Function('', body);

      if (!params.chain) {
        return tpl.toString();
      }

      return tpl;

    default:
      return params.source;
  }
});
