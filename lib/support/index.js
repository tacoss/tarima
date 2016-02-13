var engines = {
  jade: require('./jade'),
  ractive: require('./ractive'),
  coffee: require('./coffee')
};

for (var prop in engines) {
  engines[prop].support.forEach(function(ext) {
    module.exports[ext] = engines[prop];
  });
}
