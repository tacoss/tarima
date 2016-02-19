function compile(params, cb) {
  cb(null, {
    out: params.code
  });
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['js'],
  render: compile,
  compile: compile
};
