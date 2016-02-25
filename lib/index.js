var fs = require('fs'),
    path = require('path');

var support = require('./support');

var map = require('./helpers/map'),
    parse = require('./helpers/parse'),
    merge = require('./helpers/merge'),
    render = require('./helpers/render'),
    bundler = require('./helpers/bundler'),
    preFilters = require('./helpers/pre-filters'),
    postFilters = require('./helpers/post-filters');

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = locals || {};

    var pre = preFilters(params),
        post = postFilters(params);

    function finish(result) {
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

          template(merge({}, result.locals, { yield: result.source }), function(err1, subresult) {
            /* istanbul ignore else */
            if (!err1) {
              [layout].concat(subresult.dependencies).forEach(function(dep) {
                if (result.dependencies.indexOf(dep) === -1) {
                  result.dependencies.push(dep);
                }
              });

              result.source = subresult.source;

              finish(result);
            } else {
              cb(err1);
            }
          });
        } else {
          finish(result);
        }
      } else {
        cb(err);
      }
    }

    map(params, pre, function(err) {
      /* istanbul ignore else */
      if (!err) {
        render(params, next);
      } else {
        cb(err);
      }
    });
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
    getExtensions: support.getExtensions,
    isSupported: support.isSupported,
    isTemplate: support.isTemplate,
    isScript: support.isScript
  }
};
