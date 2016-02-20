var chain = require('siguiente'),
    tosource = require('tosource');

var merge = require('./merge'),
    browserify = require('./browserify');

var reTemplateFunction = /^\s*\(?\s*function.*?\(/;

function bundle(partial, locals, bundleOpts, cb) {
  partial.render(locals, function(err, result) {
    if (typeof partial.params.data._bundle === 'string') {
      bundleOpts.standalone = partial.params.data._bundle;
    }

    if (reTemplateFunction.test(result.code)) {
      result.code = 'module.exports=' + result.code.trim();
    }

    browserify(bundleOpts, result, cb);
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
      src: [],
      code: [],
      track: [],
      locals: {}
    };

    partial.forEach(function(view) {
      _.then(function(next) {
        view.render(locals, function(err, result) {
          if (!err) {
            output.src.push(result.src);

            merge(output.locals, result.locals);

            result.track.forEach(function(dep) {
              if (output.track.indexOf(dep) === -1) {
                output.track.push(dep);
              }
            });

            output.code.push(tosource(result.id) + ':' + result.code.trim());
          }

          next(err);
        });
      });
    });

    _.run(function(err) {
      output.code = 'module.exports={' + output.code.join(',\n') + '}';

      cb(err, output);
    });
  };
};
