var t = require('../lib');

var x = t.load(__dirname + '/module.es6.js', {
  babel: {
    presets: ['es2015-webpack']
  }
});

t.bundle(x).render(function(e, d) {
  console.log(e, d);
  console.log(d.source);
});
