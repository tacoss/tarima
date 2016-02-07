var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

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

function load(src, text) {
  var construct = parse(src, load);

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

module.exports = function(params) {
  var marker = (params.options.marker || '---').replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');

  var matches = params.source.match(new RegExp('(?:^|\\n)( +|)(' + marker + ')\\s*([\\s\\S]+?)\\s*\\2\\s*(?:$|\\n)'));

  if (matches) {
    params.source = params.source.replace(matches[0], (new Array(matches[0].split('\n').length)).join('\n'));
    params.options.data = load(params.filename, matches[3].replace(new RegExp('^\\s{' + matches[1].length + '}', 'gm'), ''));
  }
};
