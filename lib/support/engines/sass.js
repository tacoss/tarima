'use strict';

const merge = require('../../helpers/merge');

function render(params, cb) {
  if (params.next && params.next !== 'css') {
    cb();
    return;
  }

  const opts = merge({}, params.options.sass || {});

  this.nodeSass.render({
    outFile: params.filename,
    file: params.filename,
    data: params.source,
    indentedSyntax: params.filename.indexOf('.sass') > -1,
    includePaths: opts.includePaths || [],
    outputStyle: opts.outputStyle || 'compact',
    sourceMap: opts.sourceMap || params.options.compileDebug || false,
    omitSourceMapUrl: true,
  }, (error, result) => {
    if (!error) {
      params.source = result.css.toString();
      params.sourceMap = result.map ? JSON.parse(result.map.toString()) : undefined;
      params.deps = params.deps.concat(result.stats.includedFiles);
    }
    cb(error);
  });
}

module.exports = {
  render,
  compile: render,
  ext: 'css',
  type: 'template',
  support: ['sass', 'scss'],
  requires: ['node-sass'],
};
