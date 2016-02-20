var $ = require('../helpers/resolve');

var babel;

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

function compile(params, cb) {
  babel = babel || require($('babel-core'));

  params.code = babel.transform(params.code, {
    filename: params.src
  }).code;

  cb(null, {
    out: params.code
  });
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['es6', 'jsx'],
  requires: ['babel-core@^5'],
  render: compile,
  compile: compile
};
