'use strict';

const parse = require('../../helpers/parse');
const render = require('../../helpers/render');

module.exports = function _loader(source, map) {
  const cb = this.async();
  const sub = parse(this.resourcePath, source, _loader.params.options);

  if (!sub.isScript && sub.parts[0] !== 'js') {
    sub.parts.unshift('js');
  }

  sub.isScript = true;
  sub._import = true;

  if (_loader.params.filename === this.resourcePath) {
    return cb(null, _loader.params.source, _loader.params.sourceMap || map);
  }

  render(sub, (err, result) => cb(err, result.source, result.sourceMap || map));
};
