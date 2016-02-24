var $ = require('../helpers/resolve');

var jade;

function render(client) {
  return function(params) {
    jade = jade || require($('jade'));

    var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

    var opts = params.options.jade || {};

    opts.filename = params.filename;

    var tpl = jade[method](params.source, opts);

    params.source = !client ? tpl(params.locals) : tpl;

    return tpl.dependencies;
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
