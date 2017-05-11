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
        let _bundler = result.data._bundler || (bundleOpts && bundleOpts.bundler);

        if (!_bundler && bundleOpts && (bundleOpts.fusebox || bundleOpts['fuse-box'])) {
          _bundler = 'fusebox';
        }

        if (!_bundler && bundleOpts && bundleOpts.webpack) {
          _bundler = 'webpack';
        }

        if (!_bundler && bundleOpts && bundleOpts.rollup) {
          _bundler = 'rollup';
        }

        delete result.data._bundler;

        result._import = true;

        switch (_bundler) {
          case 'webpack':
            support.bundlers.webpack(bundleOpts, result, end);
            break;

          case 'fuse-box':
          case 'fusebox':
            support.bundlers.fuseBox(bundleOpts, result, end);
            break;

          case 'rollup':
          default:
            if (_bundler && _bundler !== 'rollup') {
              throw new Error(`Unsupported bundler: ${_bundler}`);
            }

            support.bundlers.rollup(bundleOpts, result, end);
        }
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
