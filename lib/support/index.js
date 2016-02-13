module.exports = {
  extensions: {}
};

var engines = {
  jade: require('./jade'),
  ractive: require('./ractive'),
  coffee: require('./coffee')
};

for (var prop in engines) {
  engines[prop].support.forEach(function(ext) {
    module.exports.extensions[ext] = engines[prop];
  });
}

module.exports.reSupported = new RegExp('\\.(' +
  Object.keys(module.exports.extensions).join('|') + ')(\\.\\w+|$)$');
