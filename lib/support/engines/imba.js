function render(params) {
  if (!params.next) {
    var imba = this.imbaCompiler;

    params.source = imba.compile(params.source).toString();
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['imba'],
  requires: ['imba/compiler'],
  render: render,
  compile: render
};
