'use strict';

const MAP = {};

// well-known defaults
const EXTS = [
  '.js',
  '.json',
  '.es6.js',
  '.coffee.md',
  '.css',
];

const SCRIPT = [];

/* eslint-disable global-require */

const ENGINES = {
  CoffeeScript: require('./engines/coffee'),
  TypeScript: require('./engines/typescript'),
  Markdown: require('./engines/md'),
  Pug: require('./engines/pug'),
  ES6: require('./engines/es6'),
  EJS: require('./engines/ejs'),
  Handlebars: require('./engines/hbs'),
  SASS: require('./engines/sass'),
  LESS: require('./engines/less'),
  Styl: require('./engines/styl'),
  PostCSS: require('./engines/postcss'),
  RactiveJS: require('./engines/ractive'),
  Vue2: require('./engines/vue'),
  Moon: require('./engines/moon'),
  Marko: require('./engines/marko'),
  Svelte: require('./engines/svelte'),
  Liquid: require('./engines/liquid'),
};

function _compile(render) {
  return function $compile(params) {
    /* eslint-disable prefer-spread */
    /* eslint-disable prefer-rest-params */
    return Promise.resolve()
      .then(() => render.apply(this, arguments))
      .then(() => {
        params.source = `function () { return ${JSON.stringify(params.source)}; }`;
      });
  };
}

Object.keys(ENGINES).forEach(name => {
  if (!ENGINES[name].compile) {
    ENGINES[name].compile = _compile(ENGINES[name].render);
  }

  if (ENGINES[name].ext === 'js') {
    Array.prototype.push.apply(SCRIPT, ENGINES[name].support);
  }

  ENGINES[name].support.forEach(key => {
    EXTS.push(`.${key}`);
    MAP[key] = name;
  });
});

function makeRe(exts) {
  const _keys = exts.join('|');

  return new RegExp(`\\.(?:${_keys})(?=>(?:\\.\\w+)+|$)$`);
}

const reScript = makeRe(['js', 'json'].concat(SCRIPT));
const reSupported = makeRe(['js', 'json', 'css'].concat(Object.keys(MAP)));

const reExports = /^(?:module\.)?exports\s*=|export\s+\w+/m;
const reJSONExpression = /^\s*(?:\[[\s\S]*?\]|\{[\s\S]*?\}|"\S*?"|-?\d[.\d]*|true|false|null)\s*$/;
const reTemplateFunction = /^\s*(?:function.*?\(|Handlebars\.template|Vue\.extend)/;

module.exports.bundlers = {
  rollup: require('./bundlers/rollup'),
  webpack: require('./bundlers/webpack'),
  fuseBox: require('./bundlers/fuse-box'),
};

module.exports.getExtensions = re => {
  return re ? reSupported : EXTS.slice();
};

module.exports.getEngines = () => ENGINES;

module.exports.resolve = ext => ENGINES[MAP[ext]];

const isTemplate = RegExp.prototype.test.bind(reTemplateFunction);

module.exports.isJSON = RegExp.prototype.test.bind(reJSONExpression);

module.exports.isTemplateFunction = source => {
  return !reExports.test(source) && isTemplate(source);
};

module.exports.isSupported = parts => reSupported.test(Array.isArray(parts) ? `.${parts.join('.')}` : parts);
module.exports.hasMarkdown = parts => parts.indexOf('md') > -1 || parts.indexOf('mkd') > -1 || parts.indexOf('litcoffee') > -1;
module.exports.hasScripting = parts => reScript.test(`.${parts.join('.')}`);
