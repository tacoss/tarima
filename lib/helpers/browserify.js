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

  // better strategy?
  if (opts.cache) {
    b.on('dep', function (row) {
      opts.cache[row.file] = {
        source: row.source,
        deps: merge({}, row.deps)
      };
    });
  }

  b.on('file', function(id) {
    deps.push(id);
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
      // avoid duplicated dependencies
      deps.forEach(function(dep) {
        if (params.required.indexOf(dep) === -1) {
          params.required.push(dep);
        }
      });

      params.code = buffer.toString();
      done(undefined, params);
    } else {
      done(err);
    }
  });
};
