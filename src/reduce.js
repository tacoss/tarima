
var validate = function(next, current) {
  return function() {
    var types = Array.prototype.slice.call(arguments);

    if (types.length && types.indexOf(next) === -1) {
      throw '.' + current + ' files cannot compile to .' + types.join(', .');
    }

    return true;
  };
};

var reduce_tpl = function(params, locals, call) {
  params.call = call;
  params.options.locals = locals || {};

  if (params.type === 'litcoffee') {
    params.options.literate = true;
    params.type = 'coffee';
  }

  var key = params.parts.length,
      engine;

  while (--key >= 0) {
    engine = parsers[params.type = params.parts[key]];

    if ('function' !== typeof engine) {
      throw 'Unknown ' + params.parts[key] + '-engine';
    }

    params.next = params.parts[key - 1];
    params.next = parsers[params.next || params.ext] ? params.next || params.ext : false;

    params.render = debug_tpl(params, engine)(params, validate(params.next, params.type));
    params.source = debug_tpl(params, params.render)(locals);
  }

  return params;
};
