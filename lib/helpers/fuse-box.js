var path = require('path');

var _render = require('./_render'),
    support = require('../support');

var fsbx;

module.exports = function(options, params, done) {
  fsbx = fsbx || require('fuse-box');

  var exts = support.getKnownExtensions();

  var regexp = new RegExp('\.(?:' + exts.map(function(ext) {
    return ext.replace(/^\./, '');
  }).join('|').replace(/\./g, '\\.') + ')$');

  fsbx.FuseBox.init({
    homeDir: path.dirname(params.filename),
    plugins: [{
      test: regexp,
      transform: function(file) {
        file.loadContents();

        return _render(file.info.absPath, file.contents.toString(), params)
          .then(function(result) {
            file.contents = result.source
              .replace(/import (.+?) from ([^;]+);?/g, 'var $1 = require($2);')
              .replace(/export function (\w+)/g, 'module.exports.$1 = function')
              .replace(/export default /g, 'module.exports = ')
              .replace(/export var (\w+)/g, 'module.exports.$1');

            return file.contents;
          });
      }
    }]
  }).bundle('>' + path.basename(params.filename))
  .then(function(result) {
    params.source = result.contentParts.join('');

    done(undefined, params);
  })
  .catch(done);
};
