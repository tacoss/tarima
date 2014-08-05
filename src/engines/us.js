
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params));

  if (!params.chain) {
    return tpl.toString();
  }

  return tpl;
});
