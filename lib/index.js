require('./resolver');

var fs = require('fs'),
    path = require('path');

var support = require('./support');

var map = require('./helpers/map'),
    parse = require('./helpers/parse'),
    merge = require('./helpers/merge'),
    render = require('./helpers/render'),
    bundler = require('./helpers/bundler');

var postFilters = require('./helpers/post-filters');

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = locals || {};

    function done(result) {
      if (result._nopost) {
        return cb(undefined, result);
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

    function next(err, result) {
      /* istanbul ignore else */
      if (!err) {
        /* istanbul ignore else */
        if (params.data._render) {
          var layout = path.join(path.dirname(params.filename), params.data._render),
              template = partial(parse(layout, fs.readFileSync(layout).toString(), params.options));

          template(merge({}, { yield: result.source }, result.locals), function(err1, subresult) {
            /* istanbul ignore else */
            if (!err1) {
              [layout].concat(subresult.deps).forEach(function(dep) {
                if (result.deps.indexOf(dep) === -1) {
                  result.deps.push(dep);
                }
              });

              result.source = subresult.source;

              done(result);
            } else {
              cb(err1);
            }
          });
        } else {
          done(result);
        }
      } else {
        cb(err);
      }
    }

    render(params, next);
  };
}

module.exports = {
  load: function(filename, options) {
    return this.parse(filename, fs.readFileSync(filename).toString(), options);
  },
  parse: function(filename, source, options) {
    var params = parse(filename, source, options);

    return {
      params: params,
      render: partial(params)
    };
  },
  bundle: function(view, options) {
    return {
      render: bundler(view, options)
    };
  },
  support: {
    getKnownExtensions: support.getKnownExtensions,
    getExtensions: support.getExtensions,
    isSupported: support.isSupported,
    isTemplate: support.isTemplate,
    isScript: support.isScript,
    resolve: support.resolve
  }
};
