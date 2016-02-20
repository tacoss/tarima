var $ = require('../helpers/resolve');

var imba;

function render(params, cb) {
  imba = imba || require($('imba/compiler'));

  cb(null, {
    out: imba.compile(params.code).toString()
  });
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['imba'],
  requires: ['imba'],
  render: render,
  compile: render
};
