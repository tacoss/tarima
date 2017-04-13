function compile(params) {
  if (!params.next || params.next === 'js') {
    params.source = this.moonjs.compile(params.source).toString();
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['moon'],
  requires: ['moonjs'],
};
