
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params.options));

  if ([params.next, params.ext].indexOf('js') > -1) {
    return tpl.toString();
  }

  return tpl;
});
