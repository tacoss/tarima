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

  logger.info('\r\r{% log Serving files from: %} %s\n',
    sources.map(x => `{% yellow ${x} %}`).join('{% gray , %} '));

  if (typeof options.flags.proxy === 'string') {
    _proxy = options.flags.proxy;
    _proxy.split(';').forEach(chunk => {
      const _part = chunk.trim();

      let _parts;

      if (_part.indexOf('->') !== -1 || _part.indexOf(' ') !== -1) {
        _parts = _part.split(/\*->\s*|\s+/);

        let dest = _parts[2];

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
          app.use(sub, proxy(`${dest}${dest.substr(-1) !== '/' ? sub : ''}`));
        });
      } else {
        _parts = _part.match(/^(\w+:\/\/[\w:.]+)(\/.+?)?$/);

        app.use(_parts[2] || '/', proxy(_part));
      }
    });
  }

  app.use((req, res, next) => {
    if (req.method === 'GET') {
      const src = url.parse(req.url).pathname;
      const file = path.join(options.public, src);

      if (!exists(file)) {
        const dir = path.dirname(file);
        const prefix = exists(dir) ? `${path.dirname(src)}/` : '/';

        req.url = `${prefix}${options.index || 'index.html'}`;
      }
    }

    next();
  });

  app.use(serveStatic(options.public));

  if (serveDirs) {
    (!Array.isArray(serveDirs) ? [serveDirs] : serveDirs)
      .forEach(dir => {
        app.use(serveStatic(dir));
      });
  }

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
