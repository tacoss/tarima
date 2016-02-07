var fs = require('fs'),
    path = require('path');

var map = require('./helpers/map'),
    merge = require('./helpers/merge'),
    render = require('./helpers/render'),
    preFilters = require('./helpers/pre-filters');

var RENDER_KEY = '_render';

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = locals || {};
    params.parts = path.basename(params.filename).split('.');
    params.name = params.parts.shift();
    params.ext = params.parts[0];

    function finish(err, result) {
      // TODO: post-filters
      cb(err, result);
    }

    function next(err, result) {
      if (!err) {
        if (result.locals[RENDER_KEY]) {
          var layout = path.join(path.dirname(params.filename), result.locals[RENDER_KEY]);

          delete result.locals[RENDER_KEY];

          var template = partial({
            filename: layout,
            options: params.options || {},
            source: fs.readFileSync(layout).toString()
          });

          template(merge({}, result.locals, { yield: result.code }), function(err1, subresult) {
            if (!err1) {
              [layout].concat(subresult.required).forEach(function(dep) {
                if (result.required.indexOf(dep) === -1) {
                  result.required.push(dep);
                }
              });

              result.code = subresult.code;

              finish(err, result);
            } else {
              cb(err1);
            }
          });
        } else {
          cb(err, result);
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
    return {
      render: partial({
        filename: filename,
        options: options || {},
        source: source || ''
      })
    };
  },
  bundle: function() {}
};
