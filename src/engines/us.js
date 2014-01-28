
register_engine('us', function(params) {
  var tpl = _.template(params.source, null, defs_tpl('lodash', params.options));

  switch (params.next) {
    case 'js':
      return tpl.toString();
    case 'md':
    case 'hbs':
    case 'jade':
    case 'html':
    case 'less':
    case 'coffee':
      return tpl(params.options.locals);
  }

  if (!params.next) {
    return tpl;
  }

  return params.source;
});
