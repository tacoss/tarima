var $ = require('../helpers/resolve'),
    merge = require('../helpers/merge');

var less;

function compile(params, cb) {
  var source = [];

  source.push('function (locals) { var s;');
  source.push('less.render(' + JSON.stringify(params.code));
  source.push(', { async: false, globalVars: locals }, function(err, data) {');
  source.push('if (err) throw err; s = data.css || data; });');
  source.push('return s;}');

  cb(null, {
    out: source.join('')
  });
}

function render(params, cb) {
  less = less || require($('less'));

  var opts = {},
      vars = {};

  merge(vars, params.locals);

  opts.paths = [].concat(opts.paths || []);
  opts.globalVars = opts.globalVars || {};

  merge(opts.globalVars, vars);

  var globals = Object.keys(opts.globalVars).length;

  if (!globals) {
    delete opts.globalVars;
  }

  opts.sync = true;
  opts.syncImport = true;
  opts.filename = params.src;

  less.render(params.code, opts, function(err, data) {
    if (err) {
      err.line -= globals;

      return cb(err);
    }

    cb(null, {
      out: data.css,
      deps: data.imports
    });
  });
}

module.exports = {
  ext: 'css',
  type: 'template',
  support: ['less'],
  required: ['less'],
  render: render,
  compile: compile,
  included: "var less=(typeof window!=='undefined'?window:global).less||require('l'+'ess');"
};
