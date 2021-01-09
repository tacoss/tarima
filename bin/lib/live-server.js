const liveServer = require('live-server');

function run(next) {
  const options = this.opts;
  const serveDirs = options.serve || [];

  if (typeof options.liveServer.proxy === 'string') {
    options.liveServer.proxy = options.liveServer.proxy.split(';').reduce((memo, chunk) => {
      const _part = chunk.trim();

      let _parts;

      if (_part.indexOf('->') !== -1 || _part.indexOf(' ') !== -1) {
        _parts = _part.split(/\s*->\s*|\s+/);

        let dest = _parts[1];

        if (/^\d+/.test(dest)) {
          dest = `:${dest}`;
        }

        if (dest.charAt() === ':') {
          dest = `0.0.0.0${dest}`;
        }

        if (dest.indexOf('://') === -1) {
          dest = `http://${dest}`;
        }

        _parts[0].split(',').forEach(sub => {
          memo.push([sub, `${dest}${dest.substr(-1) !== '/' ? sub : ''}`]);
        });
      } else {
        _parts = _part.match(/^(\w+:\/\/[\w:.]+)(\/.*?)?$/);

        memo.push([(_parts && _parts[2]) || '/', _part]);
      }

      return memo;
    }, []);
  }

  liveServer.start({
    ...options.liveServer,
    root: options.public,
    wait: 200,
    logLevel: 0,
    watch: [options.output].concat(serveDirs),
    mount: (!Array.isArray(serveDirs) ? [serveDirs] : serveDirs).map(_cwd => ['/', _cwd]),
  });
  next();
}

module.exports = function $liveServer(cb) {
  if (this.opts.watch) {
    run.call(this, cb);
  } else {
    cb();
  }
};
