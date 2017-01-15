function render(client) {
  return function(params) {
    var pug = this.pug;
    var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

    var deps = [];
    var opts = params.options.pug || {};

    opts.cache = true;
    opts.pretty = true;
    opts.filename = params.filename;
    opts.inlineRuntimeFunctions = false;
    opts.compileDebug = params.options.compileDebug;

    if (opts.sourceMap || opts.compileDebug) {
      opts.compileDebug = true;

      var result = this.genPugSourceMap(params.filename, params.source);

      params.source = result.data;
      params.sourceMap = result.map;

      // FIXME: debug this
      deps = result.dependencies || [];
    } else {
      var tpl = pug[method](params.source, opts);

      deps = tpl.dependencies;

      params.source = !client ? tpl(params.locals) : tpl.body;
    }

    return deps;
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
    'js',
    'vue.ejs',
    'vue.hbs',
    'vue'
  ],
  support: ['pug', 'jade'],
  requires: ['pug', 'gen-pug-source-map'],
  render: render(),
  compile: render(true),
  included: "var pug=pug||(typeof window!=='undefined'?window:global).pug||require('p'+'ug-runtime');"
};
