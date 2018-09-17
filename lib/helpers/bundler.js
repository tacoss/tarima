'use strict';

const merge = require('./merge');
const render = require('./render');
const support = require('../support');

const postFilters = require('./post-filters');

module.exports = (params, bundleOpts) => {
  return (locals, cb) => {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = merge({}, params.locals, locals);

    const end = postFilters(params, cb);

    render(params, (err, result) => {
      /* istanbul ignore if */
      if (err) {
        end(err);
        return;
      }

      if (result.isScript) {
        result._import = true;

        support.rollupBundler(bundleOpts, result, end);
      } else {
        if (support.isJSON(result.source)
          || support.isTemplateFunction(result.source)) {
          result.source = `module.exports = ${result.source}`;
        }

        end();
      }
    });
  };
};
