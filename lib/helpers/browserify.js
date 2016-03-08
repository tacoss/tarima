var browserify;

var path = require('path'),
    through = require('through'),
    tosource = require('tosource'),
    Readable = require('stream').Readable;

var merge = require('./merge'),
    parse = require('./parse'),
    render = require('./render');

var support = require('../support');

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
      '.es6',
      '.es6.js',
      '.imba',
      '.jisp',
      '.coffee',
      '.coffee.md',
      '.litcoffee',
      // templating
      '.less', '.ract', '.idom', '.jade', '.hbs', '.ejs',
      '.ract.jade', '.idom.jade', '.hbs.jade', '.ejs.jade',
      '.js.less', '.js.ract', '.js.idom', '.js.jade', '.js.hbs', '.js.ejs',
      '.js.ract.jade', '.js.idom.jade', '.js.hbs.jade', '.js.ejs.jade'
    ]
  };

  var deps = [];

  merge(opts, options || {});

  opts.basedir = path.dirname(params.filename);
  opts.entries = ensureReadable(params.source);

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
        /* istanbul ignore if */
        if (e) {
          return done(e);
        }

        if (out.extension !== 'js') {
          out.source = 'function(){return ' + tosource(out.source.trim()) + ';};';
        }

        if (support.isTemplateFunction(out.source)) {
          out.source = 'module.exports=' + out.source;
        }

        var prefix = out.runtimes.join('\n');

        if (prefix) {
          out.source = prefix + '\n' + out.source;
        }

        self.queue(out.source);
        self.queue(null);
      });
    });
  });

  b.bundle(function(err, buffer) {
    /* istanbul ignore else */
    if (!err) {
      // avoid duplicated dependencies
      deps.forEach(function(dep) {
        if (params.dependencies.indexOf(dep) === -1) {
          params.dependencies.push(dep);
        }
      });

      params.source = buffer.toString();
      done(undefined, params);
    } else {
      done(err);
    }
  });
};
