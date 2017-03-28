var parse = require('./parse');
var render = require('./render');

module.exports = function _loader(source, map) {
  var cb = this.async();

  var params = parse(this.resourcePath, source, _loader.params);

  render(params)
    .then(function(result) { cb(undefined, result.source, result.sourceMap || map); })
    .catch(function(error) { cb(error); });
};
