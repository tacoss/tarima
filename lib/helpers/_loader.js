var tosource = require('tosource');

var support = require('../support'),
    render = require('./render'),
    parse = require('./parse');

module.exports = function _loader(source, map) {
  var cb = this.async();

  var params = _loader.params;
  var partial = parse(this.resourcePath, source, params.options);

  Object.keys(partial.data).forEach(function(key) {
    if (typeof params.data[key] === 'undefined') {
      params.data[key] = partial.data[key];
    }
  });

  partial.deps.forEach(function(dep) {
    if (params.deps.indexOf(dep) === -1) {
      params.deps.push(dep);
    }
  });

  render(partial, function(e, out) {
    if (e) {
      return cb(e);
    }

    if (out.extension !== 'js') {
      out.source = 'function(){return ' + tosource(out.source.trim()) + ';};';
    }

    if (support.isTemplateFunction(out.source)) {
      out.source = 'export default ' + out.source + ';';
    }

    var prefix = out.runtimes.join('\n');

    if (prefix) {
      out.source = prefix + '\n' + out.source;
    }

    out.deps.forEach(function(dep) {
      if (params.deps.indexOf(dep) === -1) {
        params.deps.push(dep);
      }
    });

    cb(undefined, out.source, out.sourceMap || map);
  });
};
