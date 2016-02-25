var chain = require('siguiente'),
    tosource = require('tosource');

var merge = require('./merge'),
    browserify = require('./browserify');

var support = require('../support');

function bundle(partial, locals, bundleOpts, cb) {
  partial.render(locals, function(err, result) {
    /* istanbul ignore if */
    if (err) {
      return cb(err);
    }

    if (typeof partial.params.data._bundle === 'string') {
      bundleOpts.standalone = partial.params.data._bundle;
    }

    if (!support.hasExports(result.source) && !support.isTemplateFunction(result.code)) {
      result.source = 'module.exports=' + tosource(result.source);
    }

    if (support.hasRequires(result.source)) {
      browserify(bundleOpts, result, cb);
    } else {
      var prefix = result.runtimes.join('\n');

      result.source = (prefix ? prefix + '\n' : '') + result.source;

      cb(undefined, result);
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

    var _ = chain();

    var output = {
      dependencies: [],
      filenames: [],
      runtimes: [],
      sources: [],
      locals: {}
    };

    partial.forEach(function(view) {
      _.then(function(next) {
        view.render(locals, function(err, result) {
          if (!err) {
            output.filenames.push(result.filename);

            merge(output.locals, result.locals);

            ['dependencies', 'runtimes'].forEach(function(key) {
              result[key].forEach(function(dep) {
                if (output[key].indexOf(dep) === -1) {
                  output[key].push(dep);
                }
              });
            });

            if (!support.isTemplateFunction(result.source)) {
              result.source = 'function(){return ' + tosource(result.source.trim()) + ';}';
            }

            output.sources.push(tosource(result.name) + ':' + result.source);
          }

          next(err);
        });
      });
    });

    _.run(function(err) {
      var prefix = output.runtimes.join('\n');

      output.source = (prefix ? prefix + '\n' : '')
        + 'module.exports={' + output.sources.join(',\n') + '}';

      cb(err, output);
    });
  };
};
