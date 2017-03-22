var merge = require('../../helpers/merge');

function render(params, cb) {
  if (params.next && params.next !== 'css') {
    return cb();
  }

  var opts = merge({}, params.options.sass || {});
  var sass = this.nodeSass;

  sass.render({
    outFile: params.filename,
    file: params.filename,
    data: params.source,
    indentedSyntax: params.filename.indexOf('.sass') > -1,
    includePaths: opts.includePaths || [],
    outputStyle: opts.outputStyle || 'compact',
    sourceMap: opts.sourceMap || params.options.compileDebug || false,
    omitSourceMapUrl: true,
  }, function(error, result) {
    if (error) {
      cb(error);
    } else {
      params.source = result.css.toString();
      params.sourceMap = result.map ? JSON.parse(result.map.toString()) : undefined;

      cb(undefined, result.stats.includedFiles);
    }
  });
}

module.exports = {
  ext: 'css',
  type: 'template',
  support: ['sass', 'scss'],
  requires: ['node-sass'],
  render: render,
  compile: render
};
