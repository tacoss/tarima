var babel;

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

function compile(params, cb) {
  if (params.ext === 'es6' || params.ext === 'jsx') {
    babel = babel || require('babel-core');

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
  type: 'script',
  support: ['js', 'jsx', 'es6'],
  required: ['babel-core'],
  render: compile,
  compile: compile
};
