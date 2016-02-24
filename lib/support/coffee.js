var $ = require('../helpers/resolve');

var coffee;

function compile(params) {
  coffee = coffee || require($('coffee-script'));

  var opts = params.options.coffee || {};

  opts.filename = params.filename;
  opts.base = true;

  params.source = coffee.compile(params.source, opts);
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['coffee', 'litcoffee'],
  requires: ['coffee-script'],
  render: compile,
  compile: compile
};
