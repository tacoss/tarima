
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params.options));

  if (!params.next || 'js' === params.next) {
    return tpl.toString();
  }

  return tpl;
});
