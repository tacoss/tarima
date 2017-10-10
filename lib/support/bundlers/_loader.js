'use strict';

const parse = require('../../helpers/parse');
const render = require('../../helpers/render');
const support = require('../../support');

module.exports = function _loader(source, map) {
  const cb = this.async();
  const sub = parse(this.resourcePath, source, _loader.params.options);

  sub._import = true;

  if (_loader.params.filename === this.resourcePath) {
    return cb(null, _loader.params.source, _loader.params.sourceMap || map);
  }

  render(sub, (err, result) => {
    if (!sub.isScript) {
      result.source = `module.exports = ${support.wrapOutput(result.source)}`;
    }

    result.runtimes.forEach(code => {
      if (_loader.params.runtimes.indexOf(code) === -1) {
        _loader.params.runtimes.push(code);
      }
    });

    result.deps.forEach(dep => {
      if (_loader.params.deps.indexOf(dep) === -1) {
        _loader.params.deps.push(dep);
      }
    });

    Object.keys(result.data).forEach(key => {
      if (typeof _loader.params.data[key] === 'undefined') {
        _loader.params.data[key] = result.data[key];
      }
    });

    cb(err, result.source, result.sourceMap || map);
  });
};
