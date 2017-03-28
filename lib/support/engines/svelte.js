'use strict';

function compile(params) {
  if (!params.next || params.next === 'js') {
    // bundle by default (CamelCase)
    params.data._bundle = params.name[0].toUpperCase()
      + params.name.slice(1).replace(/\W(\w)/, ($0, char) => char.toUpperCase());

    params.source = this.svelte.compile(params.source, {
      name: params.data._bundle,
    }).code;
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  type: 'script',
  support: ['svelte'],
  requires: ['svelte'],
};
