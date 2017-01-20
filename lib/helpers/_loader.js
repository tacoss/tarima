var _render = require('./_render');

module.exports = function _loader(source, map) {
  var cb = this.async();

  _render(this.resourcePath, source, _loader.params)
    .then(function(result) { cb(undefined, result.source, result.sourceMap || map); })
    .catch(function(error) { cb(error); });
};
