function compile(params) {
  if (params.next === 'sv' || params.next === 'js') {
    var Svelte = this.svelte;

    // bundle by default (CamelCase)
    params.data._bundle = params.name[0].toUpperCase()
      + params.name.slice(1).replace(/\W(\w)/, function($0, char) {
        return char.toUpperCase();
      });

    params.source = Svelte.compile(params.source, {
      name: params.data._bundle
    }).code;
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  prefix: [
    'js',
    'js.ejs',
    'js.hbs'
  ],
  support: ['sv', 'svelte', 'html'],
  requires: ['svelte'],
  render: compile,
  compile: compile
};
