
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params.options));

  if ('js' === params.next) {
    return tpl.toString();
  }

  if ('us' !== params.next) {
    return !params.call ? tpl(params.options.locals) :tpl;
  }
});
