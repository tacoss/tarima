
var reduce_tpl = function(params, locals, raw) {
  params.type = params.parts.pop();

  if (params.type || raw) {
    params.head = !raw || params.parts.length > 0;
    params.render = parsers[params.type] ? debug_tpl(params, parsers[params.type])(params) : false;

    if (params.render) {
      params.render = params.head || 'string' === typeof params.render ? params.render : toSource(params.render);
      params.source = debug_tpl(params, params.render)(locals);
      params = reduce_tpl(params, locals, raw);
    }
  }

  return params;
};
