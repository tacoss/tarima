var engines = {
  jade: require('./jade'),
  ractive: require('./ractive')
};

for (var prop in engines) {
  engines[prop].input.forEach(function(ext) {
    module.exports[ext] = engines[prop];
  });
}
