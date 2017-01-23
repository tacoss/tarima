var closureCompiler;

module.exports = function(options, params, done) {
  closureCompiler = closureCompiler || require('google-closure-compiler-js');

  options = options || {};

  var closureOptions = options.closure || {};
  var sourceMaps = closureOptions.sourceMap || params.options.compileDebug || false;

  var out = closureCompiler.compile({
    jsCode: [
      {
        src: params.source,
        path: params.filename,
        sourceMap: params.sourceMap
      }
    ],
    env:  closureOptions.env || 'CUSTOM',
    rewritePolyfills: closureOptions.rewritePolyfills || false,
    assumeFunctionWrapper: closureOptions.assumeFunctionWrapper || true,
    processCommonJsModules: closureOptions.processCommonJsModules || false,
    compilationLevel: closureOptions.compilationLevel || 'SIMPLE',
    applyInputSourceMaps: sourceMaps,
    createSourceMap: sourceMaps
  });

  params.source = out.compiledCode;
  params.sourceMap = out.sourceMap ? JSON.parse(out.sourceMap) : undefined;

  done(undefined, params);
};
