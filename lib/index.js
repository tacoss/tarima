'use strict';

// https://github.com/vuejs/vue/issues/5361
global.Reflect = global.Reflect || {};
global.Reflect.ownKeys = global.Reflect.ownKeys || {};

require('./resolver');

const fs = require('fs');

const support = require('./support');

const merge = require('./helpers/merge');
const parse = require('./helpers/parse');
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
    const params = parse(filename, source, options);

    return {
      params,
      render: partial(params),
      bundle: bundler(params, options),
    };
  },
  support: {
    resolve: support.resolve,
    getEngines: support.getEngines,
    getExtensions: support.getExtensions,
    isJSON: support.isJSON,
    isSupported: support.isSupported,
    isTemplateFunction: support.isSupported,
  },
};
