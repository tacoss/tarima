'use strict';

const fs = require('fs');
const path = require('path');

let yaml;

function IncludedFile(obj) {
  Object.keys(obj).forEach(k => {
    this[k] = obj[k];
  });
}

function resolve(value) {
  return typeof value === 'string';
}

function parse(src, next, files) {
  return value => {
    const inc = path.resolve(path.dirname(src), value);
    const text = fs.readFileSync(inc).toString();

    if (src.indexOf('.json') !== -1) {
      const data = new IncludedFile(JSON.parse(text));

      files.push(src);

      return data;
    }

    const data = new IncludedFile(next(inc, text, files));

    files.push(inc);

    return data;
  };
}

function load(src, text, files) {
  const construct = parse(src, load, files);

  return yaml.safeLoad(text, {
    filename: src,
    schema: yaml.Schema.create([new yaml.Type('!include', {
      resolve,
      construct,
      kind: 'scalar',
      instanceOf: IncludedFile,
    })]),
  });
}

module.exports = (src, text) => {
  /* eslint-disable global-require */
  yaml = yaml || require('js-yaml');

  const files = [];
  const data = load(src, text, files) || {};

  return {
    obj: data,
    src: files,
  };
};
