'use strict';

const path = require('path');

const merge = require('./merge');
const loader = require('./_loader');
const support = require('../support');

let webpack;
let MemoryFileSystem;

module.exports = (options, params, done) => {
  /* eslint-disable global-require */
  MemoryFileSystem = MemoryFileSystem || require('memory-fs');
  webpack = webpack || require('webpack');

  options = options || {};

  const webpackOptions = merge({}, options.webpack || {});
  const ignoredPaths = ['node_modules', 'bower_components'].concat(options.bundleIgnore || []);

  webpackOptions.entry = params.filename;
  webpackOptions.module = webpackOptions.module || {
    loaders: [{
      loader: require.resolve('./_loader'),
      test: support.getExtensions(true),
    }],
  };

  webpackOptions.resolve = {
    extensions: support.getExtensions(),
  };

  const bundleName = typeof params.data._bundle === 'string'
    ? params.data._bundle
    : webpackOptions.bundle || 'main';

  webpackOptions.output = {
    library: bundleName,
    libraryTarget: params.data._format || webpackOptions.format || 'var',
  };

  // dirty hack
  loader.params = params;

  const compiler = webpack(webpackOptions, (err, stats) => {
    if (err || stats.hasErrors()) {
      const info = stats.toJson();

      info.errors.forEach(e => { console.error(`[webpack] ${e.message || e.toString()}`); });
      info.warnings.forEach(e => { console.warn(`[webpack] ${e.message || e.toString()}`); });
    }

    stats.toJson({
      assets: true,
      hash: true,
    }).modules.filter(m => {
      const _key = options.cwd ? path.relative(options.cwd, m.identifier) : m.identifier;

      for (let i = 0, c = ignoredPaths.length; i < c; i += 1) {
        if (_key.indexOf(ignoredPaths[i]) > -1) {
          return false;
        }
      }

      return true;
    }).forEach(m => {
      // retrieve original path
      const id = m.identifier.split('_loader.js!').pop();

      if (params.deps.indexOf(id) === -1 && id !== params.filename) {
        params.deps.push(id);
      }
    });

    // reset
    delete loader.params;

    done();
  });

  const fs = compiler.outputFileSystem = new MemoryFileSystem();

  compiler.plugin('after-emit', (compilation, cb) => {
    Object.keys(compilation.assets).forEach(outname => {
      if (compilation.assets[outname].emitted) {
        params.source = fs.readFileSync(fs.join(compiler.outputPath, outname)).toString();
      }
    });

    cb();
  });
};
