var $ = require('../helpers/resolve'),
    merge = require('../helpers/merge');

var less;

function compile(params) {
  var source = [];

  source.push('function (locals) { var s;');
  source.push('less.render(' + JSON.stringify(params.code));
  source.push(', { async: false, globalVars: locals }, function(err, data) {');
  source.push('if (err) throw err; s = data.css || data; });');
  source.push('return s;}');

  params.source = source.join('');
}

function render(params, cb) {
  if (params.next && params.next !== 'css') {
    return cb();
  }

  less = less || require($('less'));

  var opts = params.options.less || {},
      vars = {};

  merge(vars, params.locals);

  opts.paths = [].concat(opts.paths || []);
  opts.globalVars = opts.globalVars || {};

  merge(opts.globalVars, vars);

  for (var k in opts.globalVars) {
    if (typeof opts.globalVars[k] !== 'string') {
      delete opts.globalVars[k];
    }
  }

  var globals = Object.keys(opts.globalVars).length;

  if (!globals) {
    delete opts.globalVars;
  }

  opts.sync = true;
  opts.syncImport = true;
  opts.filename = params.filename;

  less.render(params.source, opts, function(err, data) {
    if (err) {
      err.line -= globals;

      return cb(err);
    }

    params.source = data.css;

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
  included: "var less=(typeof window!=='undefined'?window:global).less||require('l'+'ess');"
};
