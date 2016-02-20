var $ = require('../helpers/resolve');

var jisp;

function render(params, cb) {
  jisp = jisp || require($('jisp'));

  cb(null, {
    out: jisp.compile(params.code)
  });
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['jisp'],
  requires: ['jisp'],
  render: render,
  compile: render
};
