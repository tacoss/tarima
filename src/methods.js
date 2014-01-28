
var parsers = {};

var from_source,
    register_engine;

module.exports.add = register_engine = function(type, block) {
  parsers[type] = block;
};

module.exports.parse = from_source = function(path, source, options) {
  var params = params_tpl(path),
      key = params.name;

  defaults(params, {
    options: options || {},
    source: String(source)
  });

  if (params.options.cwd) {
    key = params.filepath.replace(params.options.cwd, '');
    key = key.replace(/^\/+|\/+$/g, '') + '/' + params.name;
  }

  params.keypath = key.replace(/^\//, '');

  return new Partial(params);
};

module.exports.load = function(path, options) {
  try {
    return from_source(path, require('fs').readFileSync(path).toString(), options);
  } catch (e) {
    throw new Error(e.message);
  }
};

module.exports.version = {
  major: $major,
  minor: $minor,
  micro: $micro,
  date: $date
};
