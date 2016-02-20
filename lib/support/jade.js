var $ = require('../helpers/resolve');

var jade;

function render(client) {
  return function(params, cb) {
    jade = jade || require($('jade'));

    var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

    var opts = params.options.jade || {};

    opts.filename = params.src;

    var tpl = jade[method](params.code, opts);

    if (!client) {
      tpl.body = tpl(params.locals);
    }

    cb(null, {
      out: tpl.body,
      deps: tpl.dependencies
    });
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['jade'],
  requires: ['jade'],
  render: render(),
  compile: render(true),
  included: "var jade=(typeof window!=='undefined'?window:global).jade||require('j'+'ade/runtime');"
};
