var fs = require('fs'),
    path = require('path');

var yaml;

function IncludedFile(obj) {
  for (var k in obj) {
    this[k] = obj[k];
  }
}

function resolve(value) {
  return typeof value === 'string';
}

function parse(src, done, files) {
  return function(value) {
    var inc = path.resolve(path.dirname(src), value);

    var data = new IncludedFile(done(inc, fs.readFileSync(inc).toString()));

    files.push(inc);

    return data;
  };
}

function load(src, text, files) {
  var construct = parse(src, load, files);

  return yaml.safeLoad(text, {
    filename: src,
    schema: yaml.Schema.create([new yaml.Type('!include', {
      kind: 'scalar',
      resolve: resolve,
      construct: construct,
      instanceOf: IncludedFile
    })])
  });
}

module.exports = function(src, text) {
  yaml = yaml || require('js-yaml');

  var files = [];

  var data = load(src, text, files) || {};

  return {
    obj: data,
    src: files
  };
};
