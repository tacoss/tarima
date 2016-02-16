var path = require('path'),
    chain = require('siguiente'),
    tosource = require('tosource');

var merge = require('./merge');

var reModuleExports = /\b(?:module\.)?exports\s*=/;

function ensureWrapper(code) {
  if (!reModuleExports.test(code)) {
    code = 'module.exports=' + code.trim();
  }

  return code;
}

module.exports = function(partial, options) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var _ = chain(),
        bundle = [],
        multiple = Array.isArray(partial);

    _.catch(function(err, next) {
      console.log(err.stack || err);
      next();
    });

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
        return cb(err, {
          src: bundle[0].src,
          code: ensureWrapper(bundle[0].code),
          locals: merge({}, locals, bundle[0].locals),
          required: bundle[0].required
        });
      }

      var output = {
        src: [],
        code: '',
        locals: {},
        required: []
      };

      output.code = ensureWrapper('{' + bundle
        .map(function(view) {
          output.src.push(view.src);

          merge(output.locals, view.locals);

          view.required.forEach(function(dep) {
            if (output.required.indexOf(dep) === -1) {
              output.required.push(dep);
            }
          });

          return tosource(view.id) + ':' + view.code.trim();
        }).join(',\n') + '}');

      cb(err, output);
    });
  };
}
