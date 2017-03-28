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
    params.locals = merge({}, params.locals, locals);
    render(params, postFilters(params, cb));
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
  },
};
