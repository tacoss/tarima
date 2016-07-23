function render(params) {
  if (!params.next || params.next === 'css') {
    var styl = this.styl;

    params.source = styl(params.source).toString();
  }
}

module.exports = {
  ext: 'css',
  type: 'template',
  support: ['styl'],
  requires: ['styl'],
  render: render,
  compile: render
};
