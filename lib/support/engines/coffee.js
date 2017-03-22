var merge = require('../../helpers/merge');

function compile(params) {
  if (!params.next) {
    var coffee = this.coffeeScript;
    var opts = merge({}, params.options.coffee || {});

    opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;
    opts.literate = params.filename.indexOf('.litcoffee') > -1;
    opts.filename = params.filename;
    opts.bare = true;

    var data = coffee.compile(params.source, opts);

    params.source = data.js || data;
    params.sourceMap = data.v3SourceMap ? JSON.parse(data.v3SourceMap) : undefined;
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
