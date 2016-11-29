function compile(params) {
  if (params.next === 'sv' || params.next === 'js') {
    var Svelte = this.svelte;

    // bundle by default
    params.data._bundle = params.name[0].toUpperCase() + params.name.slice(1);
    params.source = Svelte.compile(params.source, {
      name: params.data._bundle
    }).code;
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['sv', 'svelte', 'html'],
  requires: ['svelte'],
  render: compile,
  compile: compile
};
