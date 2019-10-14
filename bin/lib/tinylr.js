const path = require('path');
const url = require('url');

let opn;
let connect;
let connect_lr;
let tiny_lr;
let proxy;
let serve_static;

function fixedBrowsers(value) {
  if (typeof value === 'string') {
    return value.replace(/\+/g, ' ').split(',').map(name => {
      return name === 'chrome' ? 'google chrome' : name;
    });
  }
}

function run(done) {
  tiny_lr = tiny_lr || require('tiny-lr');
  connect = connect || require('connect');
  connect_lr = connect_lr || require('connect-livereload');
  serve_static = serve_static || require('serve-static');
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
  app.use(connect_lr({
    src: `//localhost:${_port}/livereload.js?snipver=1`,
    port: _port
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
      const name = url.parse(req.url).pathname;

      // TODO: improve this behavior
      if (path.basename(name).indexOf('.') > -1) {
        return next();
      }

      const file = path.join(options.public, url.parse(req.url).pathname);

      if (!exists(file)) {
        req.url = `/${options.index || 'index.html'}`;
      }
    }

    next();
  });

  app.use(serve_static(options.public));

  if (serveDirs) {
    (!Array.isArray(serveDirs) ? [serveDirs] : serveDirs)
      .forEach(dir => {
        app.use(serve_static(dir));
      });
  }

  let LR;

  app.listen(port, err => {
    if (err) {
      return done(err);
    }

    // restart
    LR = tiny_lr();
    LR.listen(_port, () => {
      logger.info('\r\r{% link http://localhost:%s %}%s\n',
        port, _proxy ? ` {% gray (${_proxy.replace(/^https?:\/\//, '')}) %}` : '');

      if (options.flags.open) {
        opn = opn || require('opn');
        opn(`http://localhost:${port}`, { app: fixedBrowsers(options.flags.open) || [] })
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
              path: ''
            });
          });
        } else {
          LR.changed({
            body: {
              files: result.output
            }
          });
        }
      }, lrOptions.timeout || 100);
    }
  });
}

module.exports = function (cb) {
  if (this.opts.watch && (this.opts.flags.port || this.opts.flags.proxy)) {
    run.call(this, cb);
  } else {
    cb();
  }
};
