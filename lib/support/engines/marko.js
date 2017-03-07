function render(client) {
  return function(params) {
    var markoCompiler = this.markoCompiler;

    if (client && markoCompiler.compileForBrowser) {
      var compiled = markoCompiler.compileForBrowser(params.source, params.filename, {
        writeToDisk: false
      });

      params.source = compiled.dependencies.map(function(dep) {
        return dep.code || "require('" + dep.path + "')";
      }).concat(compiled.code).join('\n');
    } else {
      params.source = markoCompiler.compile(params.source, params.filename, {
        writeToDisk: false,
        requireTemplates: true
      });
    }

    // FIXME: this should work on bundling?
    // if (params._import) {
      params.source = 'export default (function(){'
        + 'var exports_ = {}, module = { exports: exports_ }, __filename = "' + params.filename + '";'
        + '\n' + params.source
        + '\n return module.exports;'
        + '\n})()';
    // }
  };
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['marko'],
  requires: ['marko/compiler'],
  render: render(),
  compile: render(true)
};
