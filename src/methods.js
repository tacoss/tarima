
var parsers = {};

var from_source,
    register_engine;

module.exports.add = register_engine = function(type, block) {
  parsers[type] = block;
};

module.exports.parse = from_source = function(path, source, options) {
  var params = params_tpl(path);

  defaults(params, {
    options: options || {},
    source: source
  });

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
