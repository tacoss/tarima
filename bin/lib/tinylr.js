const path = require('path');
const url = require('url');

let open;
let connect;
let connectLr;
let tinyLr;
let proxy;
let serveStatic;

function fixedBrowsers(value) {
  if (typeof value === 'string') {
    return value.replace(/\+/g, ' ').split(',').map(name => {
      return name === 'chrome' ? 'google chrome' : name;
    });
  }
}

function locateFile(dirs, src, cb) {
  return dirs.find(dir => {
    const file = path.join(dir, src);

    if (cb(file)) return file;
    return false;
  });
}

function run(done) {
  tinyLr = tinyLr || require('tiny-lr');
  connect = connect || require('connect');
  connectLr = connectLr || require('connect-livereload');
  serveStatic = serveStatic || require('serve-static');
  proxy = proxy || require('proxy-middleware');

  const app = connect();

  const cwd = this.opts.cwd;
  const exists = this.util.exists;
  const options = this.opts;
  const logger = this.logger;

  const lrOptions = this.opts.pluginOptions['tiny-lr']
    || this.opts.pluginOptions['live-reload']
    || this.opts.pluginOptions.lr || {};

  const port = options.flags.port || process.env.PORT || 3000;
  const _port = process.env.LR_PORT || 35729;

  let _proxy;

  // early as possible
  app.use(connectLr({
    src: `//localhost:${_port}/livereload.js?snipver=1`,
    port: _port,
  }));

  const serveDirs = lrOptions.serve || options.serve || [];
  const sources = [path.relative(cwd, options.public) || '.'].concat(serveDirs);
  const defaults = { preserveHost: true };

  logger.info('\r\r{% log Serving files from: %} %s\n',
    sources.map(x => `{% yellow ${x} %}`).join('{% gray , %} '));

  if (typeof options.flags.proxy === 'string') {
    _proxy = options.flags.proxy;
    _proxy.split(';').forEach(chunk => {
      const _part = chunk.trim();

      let _parts;
      let _opts;

      if (_part.indexOf('->') !== -1 || _part.indexOf(' ') !== -1) {
        _parts = _part.split(/\s*->\s*|\s+/);

        let dest = _parts[1];

        if (/^\d+/.test(dest)) {
          dest = `:${dest}`;
        }

        if (dest.charAt() === ':') {
          dest = `localhost${dest}`;
        }

        if (dest.indexOf('://') === -1) {
          dest = `http://${dest}`;
        }

        _parts[0].split(',').forEach(sub => {
          _opts = url.parse(`${dest}${dest.substr(-1) !== '/' ? sub : ''}`);
          app.use(sub, proxy({ ...defaults, ..._opts }));
        });
      } else {
        _parts = _part.match(/^(\w+:\/\/[\w:.]+)(\/.+?)?$/);
        _opts = url.parse(_part);
        app.use(_parts[2] || '/', proxy({ ...defaults, ..._opts }));
      }
    });
  }

  const dirs = [options.public].concat(!Array.isArray(serveDirs) ? [serveDirs] : serveDirs);

  app.use((req, res, next) => {
    if (req.method === 'GET') {
      const src = url.parse(req.url).pathname;
      const file = locateFile(dirs, src, dir => exists(dir));

      if (!file) {
        const baseDir = path.dirname(src);
        const fixedDir = path.join(options.public, src);

        let prefix = '';

        if (exists(fixedDir)) {
          prefix = src;
        } else if (exists(path.dirname(fixedDir))) {
          prefix = baseDir;
        }

        req.url = `/${prefix}${options.index || 'index.html'}`;
      }
    }
    next();
  });

  dirs.forEach(dir => app.use(serveStatic(dir)));

  let LR;

  app.listen(port, err => {
    if (err) {
      return done(err);
    }

    // restart
    LR = tinyLr();
    LR.listen(_port, () => {
      logger.info('\r\r{% link http://localhost:%s %}%s\n',
        port, _proxy ? ` {% gray (${_proxy.replace(/^https?:\/\//, '')}) %}` : '');

      if (options.flags.open) {
        open = open || require('open');
        open(`http://localhost:${port}`, { app: fixedBrowsers(options.flags.open) || [] })
          .catch(() => {
            // do nothing
          });
      }

      done();
    });
  });

  this.on('end', (err, result) => {
    if (!err) {
      setTimeout(() => {
        if (!result.output.length) {
          Object.keys(LR.clients).forEach(k => {
            LR.clients[k].send({
              command: 'reload',
              path: '',
            });
          });
        } else {
          LR.changed({
            body: {
              files: result.output,
            },
          });
        }
      }, lrOptions.timeout || 100);
    }
  });
}

module.exports = function $tinyLr(cb) {
  if (this.opts.watch && (this.opts.flags.port || this.opts.flags.proxy)) {
    run.call(this, cb);
  } else {
    cb();
  }
};
