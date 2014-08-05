
register_engine('css', function(params, next) {
  if (next('js', 'us', 'hbs')) {
    /* jshint evil:true */
    var body = 'return ' + JSON.stringify(params.source) + ';',
        tpl = new Function('', body);

    if (!params.chain) {
      return tpl.toString();
    }

    return tpl;
  }
});
