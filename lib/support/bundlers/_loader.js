'use strict';

const parse = require('../../helpers/parse');
const render = require('../../helpers/render');

module.exports = function _loader(source, map) {
  const cb = this.async();
  const sub = parse(this.resourcePath, source, _loader.params);

  if (!sub.isScript && sub.parts[0] !== 'js') {
    sub.parts.unshift('js');
  }

  sub.isScript = true;
  sub._import = true;

  render(sub, (err, result) => cb(err, result.source, result.sourceMap || map));
};
