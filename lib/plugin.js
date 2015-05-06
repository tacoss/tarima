'use strict';

var PLUGIN_NAME = 'gulp-tarima';

var through2 = require('through2'),
    gutil = require('gulp-util'),
    path = require('path');

var File = gutil.File,
    PluginError = gutil.PluginError;

function jst(files) {
  var code = [];

  files.forEach(function(file) {
    // console.log(file.path);
    code.push('"foo": ' + file.contents.toString());
  });

  return 'module.exports = {\n' + code.join(',\n') + '\n};';
}

module.exports = function(options) {
  var tarima = require('./');

  if (typeof options === 'string') {
    options = {
      filename: options
    };
  }

  options = options || {};

  var files = [];

  function write(file, enc, cb) {
    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    var code;

    if (file.isBuffer()) {
      var partial = tarima.parse(file.path, file.contents.toString(), options),
          data = options.locals || options.data || file.data;

      code = partial.compile(data);

      var fixed_base = path.resolve(process.cwd(), file.base),
          fixed_dir = path.dirname(path.relative(fixed_base, file.path));

      file.path = path.join(file.base, fixed_dir, partial.params.name + '.' + partial.params.ext);
    }

    if (options.filename && file.path.indexOf('.js') > -1) {
      file.contents = new Buffer(code);
      files.push(file);
      cb(null);
    } else {
      // TODO: ensure if wrapper is missing?
      if (file.path.indexOf('.js') > -1) {
        code = 'module.exports = ' + code + ';';
      }

      file.contents = new Buffer(code);
      cb(null, file);
    }
  }

  function end(cb) {
    if (options.filename) {
      var JST = jst(files);

      this.push(new File({
        path: options.filename,
        contents: new Buffer(JST)
      }));

      cb(null);
    }
  }

  return through2.obj(write, end);
};
