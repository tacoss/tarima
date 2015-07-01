'use strict';

function debug(params, partial, type) {
  return function() {
    try {
      return typeof partial === 'function' ? partial.apply(null, arguments) : partial;
    } catch (e) {
      throw new Error('compilation error from ' + type + '-engine: ' + params.filename + ' (' + e.message + ')\n' + params.source + '\n' + params.stack);
    }
  };
}

function validate(next, current) {
  return function() {
    var types = Array.prototype.slice.call(arguments);

    if (types.indexOf(next) > -1) {
      return next;
    }

    throw new Error('.' + current + ' files compiles only to .' + types.join(', .') + '; given .' + next);
  };
}

module.exports = function(parsers, params, locals, raw) {
  var length = params.parts.length,
      engine;

  while (--length >= 0) {
    var type = params.parts[length],
        next = params.parts[length - 1];

    engine = parsers[type];

    if (typeof engine === 'undefined' || (typeof parsers[params.ext] === 'undefined' && !next)) {
      return params;
    }

    params.client = raw && !params.parts[length - 1];
    params.render = debug(params, engine, type)(params, validate(next || params.ext, type));
    params.source = debug(params, params.render, type)(locals);
  }

  return params;
};
