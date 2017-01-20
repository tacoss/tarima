var path = require('path');

var _loader = require('./_loader');
var support = require('../support');

var webpack;
var MemoryFileSystem;

module.exports = function(options, params, done) {
  MemoryFileSystem = MemoryFileSystem || require('memory-fs');
  webpack = webpack || require('webpack');

  options = options || {};

  var webpackOptions = options.webpack || {};
  var ignoredPaths = ['node_modules', 'bower_components'].concat(options.bundleIgnore || []);

  var exts = support.getKnownExtensions();

  var regexp = new RegExp('\.(?:' + exts.map(function(ext) {
    return ext.replace(/^\./, '');
  }).join('|').replace(/\./g, '\\.') + ')$');

  webpackOptions.entry = params.filename;
  webpackOptions.module = webpackOptions.module || {
    loaders: [{
      test: regexp,
      loader: require.resolve('./_loader')
    }]
  };

  // dirty hack
  _loader.params = params;

  var compiler = webpack(webpackOptions, function(err, stats) {
    if (err || stats.hasErrors()) {
      var info = stats.toJson();

      info.errors.forEach(function(e) { console.error('[webpack] ' + (e.message || e.toString())); });
      info.warnings.forEach(function(e) { console.warn('[webpack] ' + (e.message || e.toString())); });
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
        // retrieve original path
        params.deps.push(m.identifier.split('_loader.js!').pop());
      }
    });

    // reset
    delete _loader.params;

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
