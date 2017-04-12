'use strict';

function upcase(val) {
  return val[0].toUpperCase()
    + val.slice(1).replace(/\W(\w)/, ($0, char) => char.toUpperCase());
}

function render(params) {
  params.source = this.svelte.compile(params.source, {
    filename: params.filename,
    name: upcase(params.name),
    generate: 'ssr',
  });
}

function compile(params) {
  if (!params.next || params.next === 'js') {
    params.source = this.svelte.compile(params.source, {
      filename: params.filename,
      name: upcase(params.name),
    }).code;
  }
}

module.exports = {
  render,
  compile,
  ext: 'html',
  support: ['svelte', 'sv'],
  requires: ['svelte'],
};
