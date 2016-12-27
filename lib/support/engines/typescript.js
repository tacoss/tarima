function compile(params) {
  if (!params.next) {
    var ts = this.typescript;
    var opts = params.options.typescript || {};

    opts.fileName = params.filename;
    opts.reportDiagnostics = true;
    opts.compilerOptions = {
      module: 'ES6'
    };

    var result = ts.transpileModule(params.source, opts);

    params.source = result.outputText;
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
