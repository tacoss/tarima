module.exports = {
  exts: {},
  types: {}
};

var engines = {
  jade: require('./jade'),
  ractive: require('./ractive'),
  coffee: require('./coffee'),
  es6: require('./es6'),
  md: require('./md'),
  less: require('./less'),
  hbs: require('./hbs'),
  styl: require('./styl'),
  jisp: require('./jisp'),
  imba: require('./imba'),
  idom: require('./idom'),
  ejs: require('./ejs')
};

var reHasExports = /\b(?:module\.)exports\s*=\s*/,
    reHasRequires = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/,
    reTemplateFunction = /^\s*(?:\(?\s*function.*?\(|Handlebars\.template)/;

var type;

for (var prop in engines) {
  engines[prop].support.forEach(function(ext) {
    module.exports.exts[ext] = engines[prop];
  });

  type = engines[prop].type;

  if (!module.exports.types[type]) {
    module.exports.types[type] = [];
  }

  Array.prototype.push.apply(module.exports.types[type], engines[prop].support);
}

function has(item, array) {
  if (Array.isArray(item)) {
    return array.filter(function(value) {
      return has(value, item);
    }).length;
  }

  for (var key in array) {
    if (array[key] === item) {
      return true;
    }
  }
}

module.exports.getExtensions = function() {
  return Object.keys(module.exports.exts);
};

module.exports.isSupported = function(filename) {
  return (new RegExp('\\.(' + Object.keys(module.exports.exts).join('|') + ')(\\.\\w+|$)$')).test(filename);
};

module.exports.isTemplate = function(ext) {
  return has(ext, module.exports.types['template']);
};

module.exports.isScript = function(ext) {
  return has(ext, module.exports.types['script']);
};

module.exports.hasExports = reHasExports.test.bind(reHasExports);
module.exports.hasRequires = reHasRequires.test.bind(reHasRequires);
module.exports.isTemplateFunction = reTemplateFunction.test.bind(reTemplateFunction);
