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

function parse(ctx, _load, files) {
  return value => {
    const inc = value.indexOf('~/') === 0
      ? value.replace(/^~\//, `${ctx.cwd}/`)
      : path.resolve(path.dirname(ctx.src), value);

    const text = fs.readFileSync(inc).toString();

    if (ctx.src.indexOf('.json') !== -1) {
      const data = new IncludedFile(JSON.parse(text));

      files.push(ctx.src);

      return data;
    }

    const data = new IncludedFile(_load({ ...ctx, src: inc }, text, files));

    files.push(inc);

    return data;
  };
}

function load(ctx, text, files) {
  const construct = parse(ctx, load, files);

  return yaml.safeLoad(text, {
    filename: ctx.src,
    schema: yaml.Schema.create([new yaml.Type('!include', {
      resolve,
      construct,
      kind: 'scalar',
      instanceOf: IncludedFile,
    })]),
  });
}

module.exports = (cwd, src, text) => {
  /* eslint-disable global-require */
  yaml = yaml || require('js-yaml');

  try {
    const files = [];
    const data = load({ cwd, src }, text, files) || {};

    return {
      obj: data,
      src: files,
    };
  } catch (e) {
    const err = `${e.message} in ${src}`;
    e.toString = () => err;
    throw e;
  }
};
