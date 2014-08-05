
var validate = function(next, current) {
  return function() {
    var types = Array.prototype.slice.call(arguments);

    if (types.indexOf(next) > -1) {
      return next;
    }

    throw new Error('.' + current + ' files compiles only to .' + types.join(', .'));
  };
};

var reduce_tpl = function(params, locals, raw) {
  params.options.locals = locals || {};

  var key = params.parts.length,
      engine;

  while (--key >= 0) {
    params.type = params.parts[key];
    engine = parsers[params.type];

    if ('function' !== typeof engine) {
      throw new Error('Unknown ' + params.type + '-engine');
    }

    params.next = params.parts[key - 1] || false;
    params.chain = raw ? (params.next ? key > -1 : 'js' !== params.ext) : true;

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
