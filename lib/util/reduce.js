var magic = require('magic-require');

var configure = require('./configure'),
    extensions = require('./extensions');

function resolve(engine, parsers) {
  if (extensions[engine]) {
    var fixedModule = 'tarima-' + extensions[engine];

    if (magic.isExists(fixedModule)) {
      magic(fixedModule)(function(ext, cb) {
        parsers[ext] = cb;
      });
    }
  }
}

module.exports = function(parsers, params, locals, raw) {
  var length = params.parts.length,
      engine;

  while (--length >= 0) {
    params.type = params.parts[length];

    if (!parsers[params.type]) {
      resolve(params.type, parsers);
    } else if (params.parts[length - 1] === 'es6') {
      // workaround for .es6.js support
      resolve('es6', parsers);
    }

    if (!(engine = parsers[params.type])) {
      return params;
    }

    params.next = params.parts[length - 1];
    params.client = raw && (params.ext === params.next);

    var tpl = engine(params, configure);

    if (typeof tpl === 'function') {
      params.source = tpl(locals);
    }

    if (typeof tpl === 'string') {
      params.source = tpl;
    }

    if (Array.isArray(params.options.raw) && params.options.raw.indexOf(params.next) > -1) {
      return params;
    }
  }

  return params;
};
