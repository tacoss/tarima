var tosource = require('tosource');

var map = require('./map'),
    merge = require('./merge'),
    rollup = require('./rollup'),
    webpack = require('./webpack'),
    fuseBox = require('./fuse-box');

var support = require('../support');

var postFilters = require('./post-filters');

// CommonJS for default (may be configurable)
var EXPORT_PREFIX = {
  es6: 'export default ',
  cjs: 'module.exports=',
};

var isJSON = /^\s*(?:\{[\s\S]*\}|"[\s\S]*"|\[[\s\S]*\]|-?\d.*|true|false|null)\s*$/;

function bundle(partial, locals, bundleOpts, cb) {
  function next(err, result) {
    if (err) {
      return cb(err);
    }

    try {
      var post = postFilters(result);
    } catch (e) {
      return cb(e, result);
    }

    map(result, post, function(err2) {
      cb(err2, result);
    });
  }

  // dirty check
  partial.params._nopost = true;

  partial.render(locals, function(err, result) {
    /* istanbul ignore if */
    if (err) {
      return next(err);
    }

    var _bundler = partial.params.data._bundler || (bundleOpts && bundleOpts.bundler);

    delete partial.params.data._bundler;

    if (!result.isTemplate) {
      switch (_bundler) {
        case 'webpack':
          webpack(bundleOpts, result, next);
          break;

        case 'fuse-box':
          fuseBox(bundleOpts, result, next);
          break;

        case 'rollup':
        default:
          if (_bundler && _bundler !== 'rollup') {
            throw new Error('Unknown bundler: ' + _bundler);
          }

          rollup(bundleOpts, result, next);
      }
    } else {
      var prefix = result.runtimes.join('\n');
      var _exports = bundleOpts && bundleOpts.exports;

      if (support.isTemplateFunction(result.source)) {
        result.source = (EXPORT_PREFIX[_exports || 'cjs'] || _exports) + result.source;
      }

      result.source = (prefix ? prefix + '\n' : '') + result.source;

      next(undefined, result);
    }
  });
}

module.exports = function(partial, bundleOpts) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    if (!Array.isArray(partial)) {
      return bundle(partial, locals, bundleOpts, cb);
    }

    // TODO: promisify
    var tasks = [];

    var output = {
      filenames: [],
      runtimes: [],
      locals: {},
      deps: []
    };

    var sources = [];

    partial.forEach(function(view) {
      tasks.push(function(next) {
        view.render(locals, function(err, result) {
          if (!err) {
            output.filenames.push(result.filename);

            merge(output.locals, result.locals);

            ['deps', 'runtimes'].forEach(function(key) {
              result[key].forEach(function(dep) {
                if (output[key].indexOf(dep) === -1) {
                  output[key].push(dep);
                }
              });
            });

            if (!support.isTemplateFunction(result.source)) {
              result.source = 'function(){return ' +
                (isJSON.test(result.source) ? result.source : tosource(result.source.trim())) + ';}';
            }

            sources.push(tosource(result.name) + ':' + result.source);
          }

          next(err);
        });
      });
    });

    map(null, tasks, function(err) {
      var prefix = output.runtimes.join('\n');
      var _exports = bundleOpts && bundleOpts.exports;

      output.source = (prefix ? prefix + '\n' : '')
        + (EXPORT_PREFIX[_exports || 'cjs'] || _exports) + '{\n' + sources.join(',\n') + '}';

      cb(err, output);
    });
  };
};
