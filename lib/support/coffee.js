var $ = require('../helpers/resolve');

var coffee;

function compile(params, cb) {
  coffee = coffee || require($('coffee-script'));

  var opts = params.options.coffee || {};

  opts.filename = params.src;
  opts.base = true;

  cb(null, {
    out: coffee.compile(params.code, opts)
  });
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['coffee', 'litcoffee'],
  requires: ['coffee-script'],
  render: compile,
  compile: compile
};
