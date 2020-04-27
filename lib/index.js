'use strict';

require('global-or-local').install([
  'nsfw',
  'rollup',
  'tarima-browser-sync',
  'tarima-bower',
  'tarima-juice',
  'talavera',
  'node-notifier',
  'csso',
  'terser',
  'html-minifier',
].concat(require('./support').getDependencies()));

const fs = require('fs');

const merge = require('./helpers/merge');
const _parse = require('./helpers/parse');
const render = require('./helpers/render');
const bundler = require('./helpers/bundler');

const postFilters = require('./helpers/post-filters');

function partial(params) {
  return (locals, cb) => {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = merge({}, params.locals, locals);

    const end = postFilters(params, cb);

    render(params, end);
  };
}

module.exports = {
  load(filename, options) {
    return this.parse(filename, fs.readFileSync(filename).toString(), options);
  },
  parse(filename, source, options) {
    const params = _parse(filename, source, options);

    return {
      params,
      render: partial(params),
      bundle: bundler(params, options),
    };
  },
};
