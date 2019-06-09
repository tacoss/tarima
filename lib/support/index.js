'use strict';

const MAP = {};
const DEPS = [];

// well-known defaults
const EXTS = [
  '.js',
  '.mjs',
  '.json',
  '.es.js',
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
  YAML: require('./engines/yaml'),
  Pug: require('./engines/pug'),
  ES6: require('./engines/es6'),
  EJS: require('./engines/ejs'),
  Handlebars: require('./engines/hbs'),
  SASS: require('./engines/sass'),
  LESS: require('./engines/less'),
  Styl: require('./engines/styl'),
  PostCSS: require('./engines/postcss'),
  Liquid: require('./engines/liquid'),
  JSON: require('./engines/json'),
  AsciiDoc: require('./engines/asciidoc'),
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

  if (ENGINES[name].requires) {
    Array.prototype.push.apply(DEPS, ENGINES[name].requires
      .map(dep => dep.split('/')[0]));
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

const prefix = 'data:application/json;charset=utf-8;base64,';

module.exports.toUrl = sourceMap =>
  prefix + Buffer.from(JSON.stringify(sourceMap)).toString('base64');

const reScript = makeRe(['js', 'json'].concat(SCRIPT));
const reSupported = makeRe(['js', 'json', 'css'].concat(Object.keys(MAP)));

const reExports = /^(?:module\.)?exports\s*=|export\s+\w+/m;
const reJSONExpression = /^\s*(?:\[[\s\S]*?\]|\{[\s\S]*?\}|"\S*?"|-?\d[.\d]*|true|false|null)\s*$/;
const reTemplateFunction = /^\s*(?:function.*?\(|Handlebars\.template)/;

module.exports.rollupBundler = require('./rollup');

module.exports.getDependencies = () => DEPS.slice();

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

module.exports.wrapOutput = source => (!isTemplate(source)
  ? `function () { return ${JSON.stringify(source)}; }`
  : source);
