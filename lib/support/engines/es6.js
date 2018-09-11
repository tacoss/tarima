'use strict';

const path = require('path');

const merge = require('../../helpers/merge');

const reAsync = /\basync\s+(?:function)?\s*[(\w]/;
const reAwait = /\bawait\s+(.+?)\b/;

const _nodentRuntime = "(typeof Function.prototype.$asyncbind === 'function')||require('n'+'odent-runtime');";

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

const support = {
  sucrase(params, opts) {
    opts.transforms = opts.transforms || [
      'typescript',
      'jsx',
    ];

    if (opts.sourceMap || params.options.compileDebug) {
      opts.sourceMapOptions = {
        compiledFilename: params.filename,
      };

      opts.filePath = params.filename;
    }

    if (opts.jsx) {
      opts.jsxPragma = opts.jsx;

      delete opts.jsx;
    }

    const result = this.sucrase.transform(params.source, opts);

    params.source = result.code;
    params.sourceMap = result.sourceMap;
  },
  babel(params, opts) {
    if (parseFloat(this.babelCore.version) < 6) {
      opts.blacklist = opts.blacklist || ['es6.modules'];
    } else {
      opts.babelrc = typeof opts.babelrc !== 'boolean'
        ? Object.keys(opts).length === 0
        : opts.babelrc;

      opts.sourceFileName = params.filename;
      opts.sourceMap = opts.sourceMap || params.options.compileDebug || true;
      opts.sourceRoot = path.dirname(params.filename);
      opts.sourceType = 'module';
    }

    opts.filename = params.filename;
    opts.plugins = opts.plugins || [];

    let _nodent;

    if (!params.options.nodent
      && (reAsync.test(params.source) || reAwait.test(params.source))) {
      _nodent = true;

      opts.plugins.push(['fast-async', { spec: true }]);
    }

    const output = this.babelCore.transform(params.source, opts);

    if (_nodent) {
      params.source = output.code
        .replace(/^.*_default.*"nodent-runtime"\S+\n/, '');

      if (params.runtimes.indexOf(_nodentRuntime) === -1) {
        params.runtimes.push(_nodentRuntime);
      }
    } else {
      params.source = output.code;
    }

    params.sourceMap = output.map;
  },
  buble(params, opts) {
    opts.transforms = opts.transforms || {};
    opts.transforms.modules = false;
    opts.source = params.filename;
    opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;

    const output = this.buble.transform(params.source, opts);

    params.source = output.code;
    params.sourceMap = output.map;
  },
  traceur(params, opts) {
    const traceurOptions = opts.traceur || {};

    traceurOptions.modules = opts.modules || 'commonjs';
    traceurOptions.asyncFunctions = params.options.nodent !== true;
    traceurOptions.inputSourceMap = traceurOptions.sourceMap || opts.compileDebug || false;

    const compiler = new this.traceur.NodeCompiler(traceurOptions);

    const ret = compiler.compile(params.source, path.basename(params.filename), params.filename, path.dirname(params.filename));

    // FIXME: rollup interop
    params.source = Buffer.from(ret).toString()
      .replace(/(=\s*)\$__interopRequire/g, '$1          require');

    params.sourceMap = traceurOptions.inputSourceMap ? compiler.getSourceMap() : undefined;
  },
};

function compile(params) {
  if (!params.next) {
    let _compiler = params.data.$transpiler || params.options.transpiler || 'buble';

    if (params.options.traceur) {
      _compiler = 'traceur';
    }

    if (params.options.sucrase) {
      _compiler = 'sucrase';
    }

    if (params.options.babel) {
      _compiler = 'babel';
    }

    const opts = merge({}, typeof params.options[_compiler] === 'object' ? params.options[_compiler] : {});

    if (params.options.nodent && (reAsync.test(params.source) || reAwait.test(params.source))) {
      const nodent = this.nodent();

      const _opts = nodent.parseCompilerOptions('"use nodent-promises";', nodent.log) || {};

      _opts.parser.noNodentExtensions = false;

      _opts.mapStartLine = 1;
      _opts.sourceMap = true;
      _opts.promises = true;
      _opts.wrapAwait = true;
      _opts.noRuntime = true;

      params.source = nodent.compile(params.source, params.filename, undefined, _opts).code;

      if (params.runtimes.indexOf(_nodentRuntime) === -1) {
        params.runtimes.push(_nodentRuntime);
      }
    }

    support[_compiler].call(this, params, opts);
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['es6', 'jsx'],
  requires: ['buble', 'babel-core', 'traceur', 'nodent', 'sucrase'],
};
