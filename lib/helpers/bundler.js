'use strict';

const render = require('./render');

const rollup = require('./rollup');
// const webpack = require('./webpack');
// const fuseBox = require('./fuse-box');

const support = require('../support');

const postFilters = require('./post-filters');

const EXPORT_PREFIX = {
  es6: 'export default ',
  cjs: 'module.exports=',
};

module.exports = (params, bundleOpts) => {
  return (locals, cb) => {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    const end = postFilters(params, cb);

    render(params, (err, result) => {
      /* istanbul ignore if */
      if (err) {
        end(err);
        return;
      }

      if (result.extension === 'js' && result.isScript) {
        const _bundler = result.data._bundler || (bundleOpts && bundleOpts.bundler);

        delete result.data._bundler;

        switch (_bundler) {
          // case 'webpack':
          //   webpack(bundleOpts, result, end);
          //   break;

          // case 'fuse-box':
          //   fuseBox(bundleOpts, result, end);
          //   break;

          case 'rollup':
          default:
            if (_bundler && _bundler !== 'rollup') {
              throw new Error(`Unsupported bundler: ${_bundler}`);
            }

            rollup(bundleOpts, result, end);
        }
      } else {
        const _prefix = result.runtimes.join('\n');
        const _exports = bundleOpts && bundleOpts.exports;

        if (support.isTemplateFunction(result.source)) {
          result.source = (EXPORT_PREFIX[_exports || 'cjs'] || _exports) + result.source;
        }

        result.source = (_prefix ? `${_prefix}\n` : '') + result.source;

        end(undefined, result);
      }
    });
  };
};
