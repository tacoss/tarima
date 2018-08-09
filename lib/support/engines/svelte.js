'use strict';

const SUPPORTED_ENGINES = {
  coffee: 'CoffeeScript',
  less: 'LESS',
  md: 'Markdown',
  postcss: 'PostCSS',
  pug: 'Pug',
  sass: 'SASS',
  styl: 'Styl',
};

function preprocess(self, options, params) {
  const engines = require('..').getEngines();
  const renderer = engines[SUPPORTED_ENGINES[options.attributes.lang]].render;

  const _params = Object.assign({}, params);

  _params.source = options.content;

  // FIXME: move all api to promises to avoid this...
  return new Promise((resolve, reject) => {
    return Promise.resolve()
      .then(() => renderer.call(self, _params, err => (err ? reject(err) : resolve())))
      .then(resolve);
  }).then(() => ({ code: _params.source, map: _params.sourceMap }));
}

function normalize(compiled) {
  const js = compiled.js || { code: compiled.code, map: compiled.map };

  const css = compiled.css && typeof compiled.css === 'object'
    ? compiled.css
    : { code: compiled.css, map: compiled.cssMap };

  return { js, css, ast: compiled.ast };
}

function compile(params) {
  if (!params.next || params.next === 'js') {
    const defaults = params.options.svelte || {};

    const opts = {
      preprocess: {
        filename: params.filename,
        markup: _opts => {
          return { code: _opts.content };
        },
        style: _opts => {
          return preprocess(this, _opts, params);
        },
        script: _opts => {
          return preprocess(this, _opts, params);
        },
      },
      onwarn: defaults.onwarn || (() => {}),
      format: defaults.format || 'es',
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
  requires: ['svelte', 'coffeescript', 'less', 'kramed', 'postcss', 'pug', 'sass', 'styl'],
};
