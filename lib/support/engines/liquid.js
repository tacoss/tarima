var merge = require('../../helpers/merge');

var path = require('path');

function render(params, cb) {
  var opts = merge({}, params.options.liquid || {});
  var engine = new this.liquidNode.Engine();

  try {
    if (opts.filters) {
      if (typeof opts.filters === 'string') {
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
      .then(function(result) {
        params.source = result;
        cb(undefined, []);
      })
      .catch(function(error) {
        cb(error);
      });
  } catch (e) {
    cb(e);
  }
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['liquid'],
  requires: ['liquid-node'],
  render: render,
  compile: render,
};
