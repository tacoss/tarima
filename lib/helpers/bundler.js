var chain = require('siguiente'),
    tosource = require('tosource'),
    requiresRegex = require('requires-regex');

var merge = require('./merge'),
    support = require('../support'),
    browserify = require('./browserify');

var reHasRequire = requiresRegex(),
    reTemplateFunction = /^\s*\(?\s*function.*?\(/;

function ensureWrapper(code) {
  if (reTemplateFunction.test(code)) {
    code = 'module.exports=' + code.trim();
  }

  return code;
}

module.exports = function(partial, bundleOpts) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var _ = chain(),
        bundle = [],
        multiple = Array.isArray(partial);

    var isTemplate = !multiple && partial.params.parts.filter(support.isTemplate).length;

    (multiple ? partial : [partial]).forEach(function(view) {
      _.then(function(next) {
        view.render(locals, function(err, result) {
          if (!err) {
            bundle.push(result);
          }

          next(err);
        });
      });
    });

    _.run(function(err) {
      if (!multiple) {
        var params = {
          src: bundle[0].src,
          code: ensureWrapper(bundle[0].code),
          locals: merge({}, locals, bundle[0].locals),
          required: bundle[0].required
        };

        var isScript = bundle[0].ext === 'js' && reHasRequire.test(bundle[0].code);

        return isScript && !isTemplate
          ? browserify(bundleOpts || {}, params, cb)
          : cb(err, params);
      }

      var output = {
        src: [],
        code: '',
        locals: {},
        required: []
      };

      output.code = 'module.exports={' + bundle
        .map(function(view) {
          output.src.push(view.src);

          merge(output.locals, view.locals);

          view.required.forEach(function(dep) {
            if (output.required.indexOf(dep) === -1) {
              output.required.push(dep);
            }
          });

          return tosource(view.id) + ':' + view.code.trim();
        }).join(',\n') + '}';

      cb(err, output);
    });
  };
};
