'use strict';

function normalize(compiled) {
  const js = compiled.js || { code: compiled.code, map: compiled.map };

  const css = compiled.css && typeof compiled.css === 'object'
    ? compiled.css
    : { code: compiled.css, map: compiled.cssMap };

  return { js, css, ast: compiled.ast };
}

function compile(params) {
  if (!params.next || params.next === 'js') {
    const opts = {
      preprocess: {},
      filename: params.filename,
      format: 'es',
      name: params.name[0].toUpperCase()
        + params.name.slice(1).replace(/\W(\w)/, ($0, char) => char.toUpperCase()),
    };

    return this.svelte.preprocess(params.source, opts.preprocess).then(processed => {
      const result = normalize(this.svelte.compile(processed.toString(), opts));

      params.source = result.js.code;
      params.sourceMap = result.js.map;
    });
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['svelte', 'sv', 'svelte.pug', 'sv.pug'],
  requires: ['svelte'],
};
