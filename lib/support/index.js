var map = {},
    types = {};

var engines = {
  svelte: require('./engines/svelte'),
  sass: require('./engines/sass'),
  vue: require('./engines/vue'),
  pug: require('./engines/pug'),
  ractive: require('./engines/ractive'),
  coffee: require('./engines/coffee'),
  es6: require('./engines/es6'),
  md: require('./engines/md'),
  less: require('./engines/less'),
  hbs: require('./engines/hbs'),
  styl: require('./engines/styl'),
  jisp: require('./engines/jisp'),
  imba: require('./engines/imba'),
  idom: require('./engines/idom'),
  ejs: require('./engines/ejs'),
  postcss: require('./engines/postcss')
};

var reExports = /(?:module\.)?exports\s*=|export\s+\w+/;

var reTemplateFunction = /^\s*(?:function.*?\(|Handlebars\.template|Vue\.extend)/,
    reJSONValidate = /^\s*(?:\{[\s\S]*\}|"[\s\S]*"|\[[\s\S]*\]|-?\d.*|true|false|null)\s*$/;

var re,
    type,
    exts = [];

var known = ['.js', '.es6.js', '.coffee.md'];

for (var prop in engines) {
  engines[prop].support.forEach(function(ext) {
    if (engines[prop].prefix) {
      engines[prop].prefix.forEach(function(pre) {
        known.push('.' + pre + '.' + ext);
      });
    }

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

module.exports.getEngines = function() {
  return engines;
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
  return has(ext, ['js'].concat(types['script']));
};

module.exports.resolve = function(ext) {
  return engines[map[ext]];
};

var isTemplate = RegExp.prototype.test.bind(reTemplateFunction),
    isJSON = RegExp.prototype.test.bind(reJSONValidate);

module.exports.isTemplateFunction = function(source) {
  return !reExports.test(source) && (isJSON(source) || isTemplate(source));
};
