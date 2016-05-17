var imba;

function render(params) {
  if (!params.next) {
    imba = imba || require('imba/compiler');

    params.source = imba.compile(params.source).toString();
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['imba'],
  requires: ['imba'],
  render: render,
  compile: render
};
