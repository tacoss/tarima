function render(client) {
  return function(params) {
    var pug = this.pug;
    var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

    var tpl;
    var opts = params.options.pug || {};

    opts.cache = true;
    opts.pretty = true;
    opts.filename = params.filename;
    opts.inlineRuntimeFunctions = false;
    opts.compileDebug = params.options.compileDebug;

    if (client && (opts.sourceMap || opts.compileDebug)) {
      // required
      opts.compileDebug = true;

      tpl = pug.compileClientWithDependenciesTracked(params.source, opts);

      var result = this.genPugSourceMap(params.filename, tpl);

      var fn = eval('(' + result.data + ')');

      result.data = fn(params.locals);

      params.source = result.data;
      params.sourceMap = result.map;
    } else {
      tpl = pug[method](params.source, opts);
      params.source = !client ? tpl(params.locals) : tpl.body;
    }

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
