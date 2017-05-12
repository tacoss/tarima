'use strict';

const $ = require('./utils');

const clc = require('chalk');

const levels = [0, 'info', 'debug', 'verbose'];

let current = 0;

const symbols = {
  ok: '✔',
  err: '✗',
  log: '—',
  diff: '≠',
  warn: '⚠',
  info: 'ℹ',
  hint: '›',
  wait: '↺',
};

const styles = {
  delete: 'ok.red',
  error: 'err.red',
};

function style(_message) {
  return _message.replace(/\{([.\w]+)\|(.+?)\}(?=\s|$)/g, (_, format, message) => {
    const segments = format.split('.');
    const depth = 8;

    let colorized = clc;

    /* eslint-disable no-continue */
    while (segments.length) {
      const key = segments.shift();

      if (key === 'pad') {
        message = (new Array(depth - (message.length + 1))).join(' ') + message;
        continue;
      }

      if (symbols[key]) {
        message = `${symbols[key]} ${message}`;
        continue;
      }

      if (!colorized[key]) {
        break;
      }

      colorized = colorized[key];
    }

    if (typeof colorized === 'function') {
      return colorized(message);
    }

    return message;
  }).replace(/`(.+?)`/g, expression => clc.yellow(expression));
}

/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

function puts(message) {
  const args = Array.prototype.slice.call(arguments, 1);

  return String(message)
    .replace(/%s/g, () => args.shift());
}

function log(allowed) {
  return function _log() {
    if ((allowed - 1) < current) {
      $.echo(`\r${style(puts.apply(null, arguments))}\n`);
    }

    return this;
  };
}

module.exports = {
  status(start, type, out, cb) {
    if (!(start instanceof Date)) {
      cb = out;
      out = type;
      type = start;
      start = null;
    }

    if (typeof type === 'object') {
      cb = out;
      out = type;
      type = out.type || 'unknown';
    }

    const ok = this.isEnabled();
    const dest = out.dest || out;

    let src = out.src || out;

    if (src) {
      if (Array.isArray(src)) {
        src = `[${src.length} file${src.length !== 1 ? 's' : ''}]`;
      } else {
        src = out.src || out;
      }
    }

    let err;

    try {
      if (cb) {
        cb();
      }
    } catch (e) {
      err = e;
    }

    if (ok) {
      const diff = $.timeDiff(start);

      let base = 'gray';

      // Ns (seconds)
      if (diff.indexOf('ms') === -1) {
        base = 'yellow';

        // TODO: configure threshold?
        if (parseFloat(diff) > 2.0) {
          base = 'red';
        }
      }

      const ms = start ? `{${base}|+${diff}}` : '';

      if (err) {
        this.printf('\r  {pad.gray|%s} {err.red|%s} %s', type, src || dest, ms);
        this.writeln(err);
      } else {
        this.printf('\r  {pad.gray|%s} {%s|%s} %s', type, styles[type] || 'ok.green', dest, ms);
      }

      $.echo('\r\n');
    }
  },
  printf() {
    $.echo(style(puts.apply(null, arguments)));
  },
  writeln() {
    $.echo(`\r${puts.apply(null, arguments)}\n`);
  },
  setLevel(type) {
    current = typeof type !== 'number' ? levels.indexOf(type) : type;
  },
  getLogger() {
    return {
      info: log(1),
      debug: log(2),
      verbose: log(3),
    };
  },
  isEnabled() {
    return current > 0;
  },
  isDebug() {
    return current > 1;
  },
};
