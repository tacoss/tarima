var $ = require('../helpers/resolve');

var jade;

function render(client) {
  return function(params, cb) {
    jade = jade || require($('jade'));

    var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

    var tpl = jade[method](params.code, {
      filename: params.src
    });

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
  required: ['jade'],
  render: render(),
  compile: render(true),
  included: "var jade=(typeof window!=='undefined'?window:global).jade||require('j'+'ade/runtime');"
};
