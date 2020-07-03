const path = require('path');

const merge = require('../../helpers/merge');

function render(params, cb) {
  const opts = merge({}, params.options.liquid || {});
  const engine = new this.liquid.Engine();

  try {
    if (opts.filters) {
      if (typeof opts.filters === 'string') {
        /* eslint-disable global-require */
        try {
          opts.filters = require(opts.filters);
        } catch (e) {
          opts.filters = require(path.resolve(params.options.cwd, opts.filters));
        }
      }

      engine.registerFilters(opts.filters);
    }

    engine
      .parseAndRender(params.source, params.locals)
      .then(result => {
        params.source = result;
        cb(undefined, []);
      })
      .catch(error => {
        cb(error);
      });
  } catch (e) {
    cb(e);
  }
}

module.exports = {
  render,
  compile: render,
  ext: 'html',
  support: ['liquid'],
  requires: ['liquid'],
};
