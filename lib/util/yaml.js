var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

var err = require('./err');

function IncludedFile(obj) {
  for (var k in obj) {
    this[k] = obj[k];
  }
}

function resolve(value) {
  return typeof value === 'string';
}

function parse(src, cb) {
  return function(value) {
    var inc = path.resolve(path.dirname(src), value);

    return new IncludedFile(cb(inc, fs.readFileSync(inc).toString()));
  };
}

var load = module.exports = function(src, text, params) {
  var construct = parse(src, load);

  try {
    return yaml.safeLoad(text, {
      filename: src,
      schema: yaml.Schema.create([new yaml.Type('!include', {
        kind: 'scalar',
        resolve: resolve,
        construct: construct,
        instanceOf: IncludedFile
      })])
    });
  } catch (e) {
    throw err(e, params);
  }
};
