var $ = require('../helpers/resolve');

var imba;

function render(params) {
  imba = imba || require($('imba/compiler'));

  params.source = imba.compile(params.source).toString();
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['imba'],
  requires: ['imba'],
  render: render,
  compile: render
};
