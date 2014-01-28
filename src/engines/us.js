
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params.options));


  if ('js' === params.next) {
    return tpl.toString();
  }

  if ('html' === params.next) {
    return tpl(params.options.locals);
  }

  if (!params.next) {
    return params.call ? tpl.toString(): tpl;
  }

  return params.source;
});
