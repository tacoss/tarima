function render(client) {
  return function(params) {
    var pug = this.pug;
    var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

    var opts = params.options.pug || {};

    opts.pretty = true;
    opts.filename = params.filename;
    opts.inlineRuntimeFunctions = false;

    var tpl = pug[method](params.source, opts);

    params.source = !client ? tpl(params.locals) : tpl.body;

    return tpl.dependencies;
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  prefix: [
    'js.ejs',
    'js.hbs',
    'js.rv',
    'js.ract',
    'js.idom',
    'js'
  ],
  support: ['pug', 'jade'],
  requires: ['pug'],
  render: render(),
  compile: render(true),
  included: "var pug=pug||(typeof window!=='undefined'?window:global).pug||require('p'+'ug-runtime');"
};
