var coffee;

function compile(params) {
  if (!params.next) {
    coffee = coffee || require('coffee-script');

    var opts = params.options.coffee || {};

    opts.literate = params.filename.indexOf('.litcoffee') > -1;
    opts.filename = params.filename;
    opts.bare = true;

    params.source = coffee.compile(params.source, opts);
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['coffee', 'litcoffee'],
  requires: ['coffee-script'],
  render: compile,
  compile: compile
};
