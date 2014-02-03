
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params.options));

  if ('js' === params.next || (!params.next && 'js' === params.ext)) {
    return tpl.toString();
  }

  return tpl(params.options.locals);
});
