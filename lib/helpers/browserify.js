var browserify;

var path = require('path'),
    through = require('through'),
    Readable = require('stream').Readable;

var merge = require('./merge'),
    parse = require('./parse'),
    render = require('./render');

function ensureReadable(source) {
  var readable = new Readable({ objectMode: true });

  readable._read = function() {
    readable.push(source);
    readable.push(null);
  };

  return readable;
}

module.exports = function(options, params, done) {
  browserify = browserify || require('browserify');

  var opts = {
    commondir: false,
    detectGlobals: false,
    insertGlobals: false,
    bundleExternal: true,
    extensions: [
      // known stuff
      '.js',
      '.jsx',
      '.es6.js',
      '.imba',
      '.jisp',
      '.coffee',
      '.coffee.md',
      '.litcoffee',
      // templating (TODO: improve this list)
      '.less', '.ract', '.idom', '.jade', '.hbs', '.ejs',
      '.ract.jade', '.idom.jade', '.hbs.jade', '.ejs.jade',
      '.js.less', '.js.ract', '.js.idom', '.js.jade', '.js.hbs', '.js.ejs',
      '.js.ract.jade', '.js.idom.jade', '.js.hbs.jade', '.js.ejs.jade'
    ]
  };

  var deps = [];

  merge(opts, options || {});

  opts.basedir = path.dirname(params.src);
  opts.entries = ensureReadable(params.code);

  var b = browserify(opts);

  b.on('file', function(id) {
    // avoid duplicated dependencies
    if (deps.indexOf(id) === -1) {
      deps.push(id);
    }
  });

  b.transform(function(src) {
    var code = '';

    return through(function(buf) {
      code += buf;
    }, function() {
      var self = this;

      // TODO: inherit options?
      render(parse(src, code), function(e, out) {
        if (e) {
          return done(e);
        }

        self.queue(out.code);
        self.queue(null);
      });
    });
  });

  b.bundle(function(err, buffer) {
    if (!err) {
      // append all tracked sources without any filtering
      Array.prototype.push.apply(params.required, deps);
      params.code = buffer.toString();
      done(undefined, params);
    } else {
      done(err);
    }
  });
};
