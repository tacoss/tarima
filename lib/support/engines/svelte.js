'use strict';

function compile(params) {
  if (!params.next || params.next === 'js') {
    const opts = {
      filename: params.filename,
      name: params.name[0].toUpperCase()
        + params.name.slice(1).replace(/\W(\w)/, ($0, char) => char.toUpperCase()),
    };

    if (params.options.client !== true) {
      opts.generate = 'ssr';
    }

    const result = this.svelte.compile(params.source, opts);

    params.source = result.code;
    params.sourceMap = result.map;
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['svelte', 'sv', 'svelte.pug', 'sv.pug'],
  requires: ['svelte'],
};
