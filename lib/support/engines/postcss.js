'use strict';

const fs = require('fs');
const path = require('path');

const loadPlugins = require('../../helpers/load-plugins');
const merge = require('../../helpers/merge');

const _CACHED = {};

function compile(params) {
  if (params.next) {
    return;
  }

  const opts = merge({}, params.options.postcss || {});

  opts['postcss-import'] = opts['postcss-import'] || {};

  opts['postcss-import'].load = file => {
    const _key = path.relative(params.options.cwd, file);
    const _entry = params.options.cache[_key] || {};

    if (!_CACHED[_key] || _entry.dirty) {
      _CACHED[_key] = fs.readFileSync(file).toString();
    }

    return _CACHED[_key];
  };

  opts['postcss-import'].onImport = files => {
    files.forEach(file => {
      if (file !== params.filename && params.deps.indexOf(file) === -1) {
        params.deps.push(file);
      }
    });
  };

  opts.from = params.filename;
  opts.to = params.filename;

  return this.postcss(loadPlugins(opts.plugins || [], opts))
    .process(params.source, opts)
    .then(result => {
      result.warnings().forEach(msg => {
        console.warn(`[postcss] ${msg.type}: ${msg.test} at ${params.filename}`);
      });

      params.source = result.css;
    });
}

module.exports = {
  compile,
  render: compile,
  ext: 'css',
  support: ['post'],
  requires: ['postcss'],
};
