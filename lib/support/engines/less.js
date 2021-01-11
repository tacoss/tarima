'use strict';

const merge = require('../../helpers/merge');
const loadPlugins = require('../../helpers/load-plugins');

function render(params, cb) {
  if (params.next && params.next !== 'css') {
    cb();
    return;
  }

  const opts = merge({}, params.options.less || {});

  opts.paths = opts.paths || [];
  opts.globalVars = merge({}, params.locals || {});

  Object.keys(opts.globalVars).forEach(k => {
    if (typeof opts.globalVars[k] !== 'string') {
      delete opts.globalVars[k];
    } else if (/[^\s\w]/.test(opts.globalVars[k])) {
      opts.globalVars[k] = JSON.stringify(opts.globalVars[k]);
    }
  });

  const globals = Object.keys(opts.globalVars).length;

  /* istanbul ignore if */
  if (!globals) {
    delete opts.globalVars;
  }

  opts.sync = true;
  opts.syncImport = true;
  opts.filename = params.filename;
  opts.plugins = loadPlugins(opts.plugins || [], opts);
  opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;

  this.less.render(params.source, opts, (err, data) => {
    /* istanbul ignore if */
    if (err) {
      // TODO: test this branch!
      err.line -= globals;
      cb(err);
      return;
    }

    params.source = data.css;
    params.sourceMap = data.map ? JSON.parse(data.map) : undefined;

    if (params.sourceMap) {
      params.sourceMap.sources = params.sourceMap.sources
        .filter(src => src.indexOf('<input') === -1);
    }

    params.deps = params.deps.concat(data.imports);

    cb();
  });
}

module.exports = {
  render,
  compile: render,
  ext: 'css',
  support: ['less'],
  requires: ['less'],
  included: "var less=less||(typeof window!=='undefined'?window:global).less||require('l'+'ess');",
};
