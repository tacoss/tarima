var $ = require('../helpers/resolve');

var jisp;

function render(params) {
  jisp = jisp || require($('jisp'));

  params.source = jisp.compile(params.source);
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['jisp'],
  requires: ['jisp'],
  render: render,
  compile: render
};
