'use strict';

const MAP = {};

const EXTS = [];

/* eslint-disable global-require */

const ENGINES = {
  CoffeeScript: require('./engines/coffee'),
  TypeScript: require('./engines/typescript'),
  Markdown: require('./engines/md'),
  Pug: require('./engines/pug'),
  ES2017: require('./engines/es6'),
  EJS: require('./engines/ejs'),
  Handlebars: require('./engines/hbs'),
  SASS: require('./engines/sass'),
  LESS: require('./engines/less'),
  Styl: require('./engines/styl'),
  PostCSS: require('./engines/postcss'),
  RactiveJS: require('./engines/ractive'),
  Vue2: require('./engines/vue'),
  Marko: require('./engines/marko'),
  Svelte: require('./engines/svelte'),
};

function _compile(render) {
  return function () {
    /* eslint-disable prefer-spread */
    /* eslint-disable prefer-rest-params */
    return Promise.resolve(render.apply(null, arguments))
      .then(result => `function () { return ${JSON.stringify(result.source)}; }`);
  };
}

Object.keys(ENGINES).forEach(name => {
  if (!ENGINES[name].compile) {
    ENGINES[name].compile = _compile(ENGINES[name].render);
  }

  ENGINES[name].support.forEach(key => {
    EXTS.push(`.${key}`);
    MAP[key] = name;
  });
});

const reExports = /(?:module\.)?exports\s*=|export\s+\w+/;
const reJSONExpression = /^\s*(?:\[[\s\S]*?\]|\{[\s\S]*?\})\s*$/;
const reTemplateFunction = /^\s*(?:function.*?\(|Handlebars\.template|Vue\.extend)/;

module.exports.getExtensions = () => EXTS.slice();

module.exports.getEngines = () => ENGINES;

module.exports.resolve = ext => ENGINES[MAP[ext]];

const isTemplate = RegExp.prototype.test.bind(reTemplateFunction);

module.exports.isJSON = RegExp.prototype.test.bind(reJSONExpression);

module.exports.isTemplateFunction = source => {
  return !reExports.test(source) && isTemplate(source);
};

module.exports.isSupported = id => {
  const name = id.split('/').pop();

  for (let i = 0, c = EXTS.length; i < c; i += 1) {
    if (name.indexOf(EXTS[i]) > 0) {
      return true;
    }
  }

  return false;
};
