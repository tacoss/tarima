var map = {},
    types = {};

var engines = {
  pug: require('./pug'),
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

var reHasExports = /\b(?:module\.)?exports(?:\.\w+)?\s*=\s*/,
    reHasRequires = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/,
    reTemplateFunction = /^\s*(?:function.*?\(|Handlebars\.template)/;

var re,
    type,
    exts = [];

var known = [
  '.js',
  // legacy
  '.jade',
  '.es6.js',
  '.coffee.md'
];

for (var prop in engines) {
  engines[prop].support.forEach(function(ext) {
    known.push('.' + ext);
    exts.push(ext);

    map[ext] = prop;
  });

  type = engines[prop].type;

  if (!types[type]) {
    types[type] = [];
  }

  Array.prototype.push.apply(types[type], engines[prop].support);
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

module.exports.getKnownExtensions = function() {
  return known.slice();
};

module.exports.getExtensions = function() {
  return exts.slice();
};

module.exports.isSupported = function(filename) {
  if (filename) {
    re = re || new RegExp('\.(?:' + exts.concat('js').join('|') + ')(?=>([.\w])+)?$');

    return re.test(filename);
  }

  return false;
};

module.exports.isTemplate = function(ext) {
  return has(ext, types['template']);
};

module.exports.isScript = function(ext) {
  return has(ext, types['script']);
};

module.exports.resolve = function(ext) {
  return engines[map[ext]];
};

module.exports.hasExports = reHasExports.test.bind(reHasExports);
module.exports.hasRequires = reHasRequires.test.bind(reHasRequires);
module.exports.isTemplateFunction = reTemplateFunction.test.bind(reTemplateFunction);
