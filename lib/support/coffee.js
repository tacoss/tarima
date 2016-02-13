var coffee;

function compile(params, cb) {
  coffee = coffee || require('coffee-script');

  cb(null, {
    out: coffee.compile(params.code, {
      filename: params.src
    })
  });
}

module.exports = {
  support: ['coffee', 'litcoffee'],
  require: ['coffee-script'],
  render: compile,
  compile: compile
};
