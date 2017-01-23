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
    warningLevel: closureOptions.warningLevel || 'VERBOSE',
    outputWrapper: closureOptions.outputWrapper || '!(function(){\n%output%\n})()',
    rewritePolyfills: closureOptions.rewritePolyfills || false,
    assumeFunctionWrapper: closureOptions.assumeFunctionWrapper || true,
    processCommonJsModules: closureOptions.processCommonJsModules || false,
    compilationLevel: closureOptions.compilationLevel || 'SIMPLE',
    applyInputSourceMaps: sourceMaps,
    createSourceMap: sourceMaps
  });

  params.source = out.compiledCode;
  params.sourceMap = out.sourceMap ? JSON.parse(out.sourceMap) : undefined;

  out.errors.forEach(function(e) { console.error('[closure-compiler-js]', e.description); });
  out.warnings.forEach(function(e) { console.warn('[closure-compiler-js]', e.description); });

  done(undefined, params);
};
