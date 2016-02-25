var chain = require('siguiente'),
    tosource = require('tosource');

var merge = require('./merge'),
    browserify = require('./browserify');

var reHasRequires = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/,
    reTemplateFunction = /^\s*(?:\(?\s*function.*?\(|Handlebars\.template)/;

function bundle(partial, locals, bundleOpts, cb) {
  partial.render(locals, function(err, result) {
    /* istanbul ignore if */
    if (err) {
      return cb(err);
    }

    if (typeof partial.params.data._bundle === 'string') {
      bundleOpts.standalone = partial.params.data._bundle;
    }

    if (reTemplateFunction.test(result.source)) {
      result.source = 'module.exports=' + result.source.trim();
    }

    if (reHasRequires.test(result.source)) {
      browserify(bundleOpts, result, cb);
    } else {
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
      sources: [],
      locals: {}
    };

    partial.forEach(function(view) {
      _.then(function(next) {
        view.render(locals, function(err, result) {
          if (!err) {
            output.filenames.push(result.filename);

            merge(output.locals, result.locals);

            result.dependencies.forEach(function(dep) {
              if (output.dependencies.indexOf(dep) === -1) {
                output.dependencies.push(dep);
              }
            });

            output.sources.push(tosource(result.name) + ':' + result.source.trim());
          }

          next(err);
        });
      });
    });

    _.run(function(err) {
      output.source = 'module.exports={' + output.sources.join(',\n') + '}';

      cb(err, output);
    });
  };
};
