module.exports = {
  exts: {},
  types: {}
};

var engines = {
  jade: require('./jade'),
  ractive: require('./ractive'),
  coffee: require('./coffee'),
  es6: require('./es6')
};

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

module.exports.reSupported = new RegExp('\\.(' +
  Object.keys(module.exports.exts).join('|') + ')(\\.\\w+|$)$');
