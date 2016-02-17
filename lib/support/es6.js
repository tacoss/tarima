var $ = require('../helpers/resolve');

var babel;

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

function compile(params, cb) {
  if (params.next === 'es6' || params.ext === 'jsx') {
    babel = babel || require($('babel-core'));

    params.code = babel.transform(params.code, {
      filename: params.src
    }).code;
  }

  cb(null, {
    out: params.code
  });
}

module.exports = {
  ext: 'js',
  raw: ['es6'],
  type: 'script',
  support: ['js', 'jsx'],
  required: [],
  render: compile,
  compile: compile
};
