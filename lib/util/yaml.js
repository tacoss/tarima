'use strict';

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

function IncludedFile(obj) {
  for (var k in obj) {
    this[k] = obj[k];
  }
}

function validateTag(value) {
  return typeof value === 'string';
}

function resolve(src, cb) {
  return function(value) {
    var inc = path.resolve(path.dirname(src), value);

    return new IncludedFile(cb(inc, fs.readFileSync(inc).toString()));
  };
}

var load = module.exports = function(src, text) {
  var resolveYaml = resolve(src, load);

  return yaml.safeLoad(text, {
    filename: src,
    schema: yaml.Schema.create([new yaml.Type('!include', {
      kind: 'scalar',
      resolve: validateTag,
      construct: resolveYaml,
      instanceOf: IncludedFile
    })])
  });
};
