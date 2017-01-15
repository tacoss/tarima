function compile(params) {
  if (!params.next) {
    var ts = this.typescript;
    var opts = params.options.typescript || {};

    opts.fileName = params.filename;

    opts.compilerOptions = {
      sourceMap: opts.sourceMap || params.options.compileDebug || false,
      importHelpers: true,
      module: 'ES6',
      target: 'ES5'
    };

    var result = ts.transpileModule(params.source, opts);

    params.source = result.outputText;
    params.sourceMap = result.sourceMapText ? JSON.parse(result.sourceMapText) : undefined;

    if (params.sourceMap) {
      params.source = params.source.replace(/\n\/\/# sourceMappingURL=.+$/, '');
    }
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['ts'],
  requires: ['typescript'],
  render: compile,
  compile: compile
};
