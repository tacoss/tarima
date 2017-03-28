'use strict';

function compile(params) {
  if (!params.next || params.next === 'js') {
    if (params.options.client && this.markoCompiler.compileForBrowser) {
      const compiled = this.markoCompiler.compileForBrowser(params.source, params.filename, {
        writeToDisk: false,
      });

      params.source = compiled.dependencies
        .map(dep => dep.code || `require('${dep.path}')`)
        .concat(compiled.code)
        .join('\n');
    } else {
      params.source = this.markoCompiler.compile(params.source, params.filename, {
        writeToDisk: false,
        requireTemplates: true,
      });
    }
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  type: 'script',
  support: ['marko'],
  requires: ['marko/compiler'],
};
