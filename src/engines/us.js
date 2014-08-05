
register_engine('us', function(params) {
  return _.template(params.source, null, defs_tpl('lodash', params));
});
