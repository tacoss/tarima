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

    function finish(result) {
      map(result, postFilters(params), function(err2) {
        cb(err2, result);
      });
    }

    function next(err, result) {
      if (!err) {
        if (result.locals._render) {
          var layout = path.join(path.dirname(params.filename), result.locals._render);

          delete result.locals._render;

          var template = partial({
            filename: layout,
            options: params.options || {},
            source: fs.readFileSync(layout).toString(),
            parts: path.basename(layout).split('.').slice(1)
          });

          template(merge({}, result.locals, { yield: result.code }), function(err1, subresult) {
            if (!err1) {
              [layout].concat(subresult.required).forEach(function(dep) {
                if (result.required.indexOf(dep) === -1) {
                  result.required.push(dep);
                }
              });

              result.code = subresult.code;

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

    map(params, preFilters(params), function(err) {
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
    getRuntime: support.getRuntime,
    isSupported: support.isSupported,
    isTemplate: support.isTemplate,
    isScript: support.isScript
  }
};
