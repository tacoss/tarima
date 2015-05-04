'use strict';

var PLUGIN_NAME = 'gulp-tarima';

var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path');

var File = gutil.File,
    PluginError = gutil.PluginError,
    replaceExtension = gutil.replaceExtension;

function cjs(code) {
  if (code.indexOf('module.exports') === -1) {
    code = 'module.exports = ' + code + ';';
  }

  return code;
}

function jst(files) {
  console.log(files.map(function(file) {
    console.log(file.path, file.contents.toString());
  }));
  return '/* TODO */';
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

    if (file.isBuffer()) {
      var partial = tarima.parse(file.path, file.contents.toString(), options),
          isPlain = !options.filename && (partial.params.ext !== 'js'),
          data = options.locals || options.data || file.data;

      file.contents = new Buffer(partial[isPlain ? 'render' : 'compile'](data));
      file.path = path.join(file.base, partial.params.name + '.' + partial.params.ext);
    }

    if (options.filename) {
      files.push(file);
    } else {
      cb(null, file);
    }
  }

  function end() {
    if (options.filename) {
      var JST = jst(files)

      this.queue(new File({
        path: options.filename,
        contents: new Buffer(JST)
      }))

      this.queue(null);
    }
  }

  return through.obj(write, end);
};
