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

    cb(err, result.source, result.sourceMap || map);
  });
};
