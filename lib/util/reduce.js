'use strict';

module.exports = function(parsers, params, locals, raw) {
  var length = params.parts.length,
      engine;

  while (--length >= 0) {
    params.type = params.parts[length];

    if (!(engine = parsers[params.type])) {
      continue;
    }

    params.next = params.parts[length - 1];
    params.client = raw && (params.ext === params.next);

    var tpl = engine(params);

    if (typeof tpl === 'function') {
      params.source = tpl(locals);
    }

    if (typeof tpl === 'string') {
      params.source = tpl;
    }
  }

  return params;
};
