var $ = require('../helpers/resolve');

var styl;

function render(params) {
  styl = styl || require($('styl'));

  params.source = styl(params.source).toString();
}

module.exports = {
  ext: 'css',
  type: 'template',
  support: ['styl'],
  requires: ['styl'],
  render: render,
  compile: render
};
