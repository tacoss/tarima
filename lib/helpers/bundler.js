'use strict';

const merge = require('./merge');
const render = require('./render');

const rollup = require('./rollup');
const webpack = require('./webpack');
const fuseBox = require('./fuse-box');

const support = require('../support');

const postFilters = require('./post-filters');

module.exports = (params, bundleOpts) => {
  return (locals, cb) => {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = merge({}, params.locals, locals);
    params._import = true;

    const end = postFilters(params, cb);

    render(params, (err, result) => {
      /* istanbul ignore if */
      if (err) {
        end(err);
        return;
      }

      if (result.isScript) {
        const _bundler = result.data._bundler || (bundleOpts && bundleOpts.bundler);

        delete result.data._bundler;

        switch (_bundler) {
          case 'webpack':
            webpack(bundleOpts, result, end);
            break;

          case 'fuse-box':
          case 'fusebox':
            fuseBox(bundleOpts, result, end);
            break;

          case 'rollup':
          default:
            if (_bundler && _bundler !== 'rollup') {
              throw new Error(`Unsupported bundler: ${_bundler}`);
            }

            rollup(bundleOpts, result, end);
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
