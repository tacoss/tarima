var tosource = require('tosource'),
    Promise = require('es6-promise');

var support = require('../support'),
    render = require('./render'),
    parse = require('./parse');

module.exports = function(file, source, params) {
  return new Promise(function(resolve, reject) {
    var partial = parse(file, source, params.options);

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
        return reject(e);
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

      resolve(out);
    });
  });
};
