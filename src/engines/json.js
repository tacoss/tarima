
register_engine('json', function(params, next) {
  if (next('js')) {
    /* jshint evil:true */
    var tpl = new Function('', 'return ' + params.source.trim() + ';');

    if (!params.chain) {
      return tpl.toString();
    }

    return tpl;
  }
});
