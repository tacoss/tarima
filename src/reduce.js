
var validate = function(next, current) {
  return function() {
    var types = Array.prototype.slice.call(arguments);

    if (types.indexOf(next) > -1) {
      return true;
    }

    throw new Error('.' + current + ' files compiles only to .' + types.join(', .'));
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
    params.type = params.parts[key];
    engine = parsers[params.type];

    if ('function' !== typeof engine) {
      throw new Error('Unknown ' + params.parts[key] + '-engine');
    }

    params.next = params.parts[key - 1] || false;

    if (!parsers[params.next || params.ext]) {
      throw new Error('cannot resolve ' + params.type + '-to-' + (params.next || params.ext) + ' (' + params.filename + ')');
    }

    if ([params.next, params.ext].indexOf(params.type) === -1) {
      params.render = debug_tpl(params, engine)(params, validate(params.next || params.ext, params.type));
      params.source = debug_tpl(params, params.render)(locals);
    }
  }

  return params;
};
