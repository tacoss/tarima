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

const path = require('path');
const fs = require('fs');

function preprocess(self, options, params) {
  const engines = require('..').getEngines();

  if (options.attributes.src && !options.attributes.lang) {
    const srcFile = path.join(path.dirname(options.filename), options.attributes.src);

    options.attributes.lang = options.attributes.src.split('.').pop();
    options.filename = srcFile;
    options.content = `${fs.readFileSync(srcFile)}\n${options.content || ''}`;

    if (params.deps.indexOf(srcFile) === -1) {
      params.deps.push(srcFile);
    }
  }

  if (options.attributes.lang && options.attributes.lang !== 'js') {
    if (!SUPPORTED_ENGINES[options.attributes.lang]) {
      throw new Error(`Unknown ${options.attributes.lang} processor`);
    }

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

  return { code: options.content };
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

    const prep = {
      options: {
        filename: params.filename,
        onwarn: defaults.onwarn || (e => {
          console.warn(`[svelte/compiler] ${e.code}: ${e.message} at ${params.filename}`);
        }),
      },
      preprocess: {
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
    };

    const opts = {
      format: defaults.format || 'esm',
      name: params.name[0].toUpperCase()
        + params.name.slice(1).replace(/\W(\w)/, ($0, char) => char.toUpperCase()),
    };

    let compiler;
    let promise;

    if (parseFloat(this.svelte.VERSION) < 3) {
      opts.shared = require.resolve('svelte/shared');
      opts.format = opts.format.replace('esm', 'es');

      compiler = this.svelte;
      promise = compiler.preprocess(params.source, Object.assign({}, prep.preprocess, prep.options));
    } else {
      opts.dev = typeof params.options.compileDebug === 'boolean'
        ? params.options.compileDebug
        : false;

      compiler = require('svelte/compiler');
      promise = compiler.preprocess(params.source, prep.preprocess, prep.options);
    }

    opts.generate = (params.options.client || !params.next) ? 'dom' : 'ssr';

    return promise.then(processed => {
      const result = normalize(compiler.compile(processed.toString(), opts));

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
