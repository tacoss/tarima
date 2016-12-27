function compile(params) {
  if (!params.next) {
    var ts = this.typescript;
    var opts = params.options.typescript || {};
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
