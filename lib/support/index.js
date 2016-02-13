var engines = {
  jade: require('./jade'),
  ractive: require('./ractive')
};

for (var prop in engines) {
  engines[prop].support.forEach(function(ext) {
    module.exports[ext] = engines[prop];
  });
}
