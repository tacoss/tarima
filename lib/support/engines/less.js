var merge = require('../../helpers/merge');
var loadPlugins = require('../../helpers/load-plugins');

function compile(params) {
  var source = [];

  source.push('function (locals) { var s;');
  source.push('less.render(' + JSON.stringify(params.source));
  source.push(', { async: false, globalVars: locals }, function(err, data) {');
  source.push('if (err) throw err; s = data.css || data; });');
  source.push('return s;}');

  params.source = source.join('');
}

function render(params, cb) {
  if (params.next && params.next !== 'css') {
    return cb();
  }

  var less = this.less;
  var opts = {},
      vars = {};

  merge(opts, params.options.less || {});
  merge(vars, params.locals);

  opts.paths = opts.paths || [];
  opts.globalVars = opts.globalVars || {};

  merge(opts.globalVars, vars);

  for (var k in opts.globalVars) {
    if (typeof opts.globalVars[k] !== 'string') {
      delete opts.globalVars[k];
    } else if (/[^\s\w]/.test(opts.globalVars[k])) {
      opts.globalVars[k] = JSON.stringify(opts.globalVars[k]);
    }
  }

  var globals = Object.keys(opts.globalVars).length;

  /* istanbul ignore if */
  if (!globals) {
    delete opts.globalVars;
  }

  opts.sync = true;
  opts.syncImport = true;
  opts.filename = params.filename;
  opts.plugins = loadPlugins(opts.plugins || [], opts);
  opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;

  less.render(params.source, opts, function(err, data) {
    /* istanbul ignore if */
    if (err) {
      // TODO: test this branch!
      err.line -= globals;

      return cb(err);
    }

    params.source = data.css;
    params.sourceMap = data.map ? JSON.parse(data.map) : undefined;

    if (params.sourceMap) {
      params.sourceMap.sources = params.sourceMap.sources.filter(function(src) {
        return src.indexOf('<input') === -1;
      });
    }

    cb(undefined, data.imports);
  });
}

module.exports = {
  ext: 'css',
  type: 'template',
  support: ['less'],
  requires: ['less'],
  render: render,
  compile: compile,
  included: "var less=less||(typeof window!=='undefined'?window:global).less||require('l'+'ess');"
};
