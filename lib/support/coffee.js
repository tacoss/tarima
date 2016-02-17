var $ = require('../helpers/resolve');

var coffee;

function compile(params, cb) {
  coffee = coffee || require($('coffee-script'));

  cb(null, {
    out: coffee.compile(params.code, {
      filename: params.src
    })
  });
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['coffee', 'litcoffee'],
  required: ['coffee-script'],
  render: compile,
  compile: compile
};
