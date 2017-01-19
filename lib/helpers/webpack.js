var path = require('path');

var webpack;
var MemoryFileSystem;

module.exports = function(options, params, done) {
  MemoryFileSystem = MemoryFileSystem || require('memory-fs');
  webpack = webpack || require('webpack');

  options = options || {};

  var webpackOptions = options.webpack || {};
  var ignoredPaths = ['node_modules', 'bower_components'].concat(options.bundleIgnore || []);

  webpackOptions.entry = params.filename;

  var compiler = webpack(webpackOptions, function(err, stats) {
    if (err || stats.hasErrors()) {
      var info = stats.toJson();

      info.errors.forEach(function(e) { console.error('[webpack] ' + e.message); });
      info.warnings.forEach(function(e) { console.warn('[webpack] ' + e.message); });
    }

    stats.toJson({
      assets: true,
      hash: true,
    }).modules.filter(function(m) {
      var _key = options.cwd ? path.relative(options.cwd, m.identifier) : m.identifier;

      for (var i = 0, c = ignoredPaths.length; i < c; i += 1) {
        if (_key.indexOf(ignoredPaths[i]) > -1) {
          return false;
        }
      }

      return true;
    }).forEach(function(m) {
      if (params.deps.indexOf(m.identifier) === -1 && m.identifier !== params.filename) {
        params.deps.push(m.identifier);
      }
    });

    done(undefined, params);
  });

  var fs = compiler.outputFileSystem = new MemoryFileSystem();

  compiler.plugin('after-emit', function (compilation, cb) {
    Object.keys(compilation.assets).forEach(function (outname) {
      if (compilation.assets[outname].emitted) {
        params.source = fs.readFileSync(fs.join(compiler.outputPath, outname)).toString();
      }
    });

    cb();
  });
};
