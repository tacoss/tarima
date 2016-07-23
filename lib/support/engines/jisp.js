function render(params) {
  if (!params.next) {
    var jisp = this.jisp;

    params.source = jisp.compile(params.source);
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['jisp'],
  requires: ['jisp'],
  render: render,
  compile: render
};
