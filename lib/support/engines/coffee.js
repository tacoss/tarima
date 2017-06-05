'use strict';

const merge = require('../../helpers/merge');

function compile(params) {
  if (!params.next || params.next === 'js') {
    const opts = merge({}, params.options.coffee || {});

    opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;
    opts.literate = params.filename.indexOf('.litcoffee') > -1;
    opts.filename = params.filename;
    opts.bare = true;

    const data = this.coffeescript.compile(params.source, opts);

    params.source = data.js || data;
    params.sourceMap = data.v3SourceMap ? JSON.parse(data.v3SourceMap) : undefined;
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['coffee', 'litcoffee'],
  requires: ['coffeescript'],
};
