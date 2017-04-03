'use strict';

const merge = require('../../helpers/merge');

const path = require('path');

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

const support = {
  babel(params, opts) {
    if (parseFloat(this.babelCore.version) < 6) {
      opts.blacklist = opts.blacklist || ['es6.modules'];
    }

    opts.filename = params.filename;
    opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;

    const output = this.babelCore.transform(params.source, opts);

    params.source = output.code;
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
    traceurOptions.inputSourceMap = traceurOptions.sourceMap || opts.compileDebug || false;

    const compiler = new this.traceur.NodeCompiler(traceurOptions);

    const ret = compiler.compile(params.source, path.basename(params.filename), params.filename, path.dirname(params.filename));

    // FIXME: rollup interop
    params.source = new Buffer(ret).toString()
      .replace(/(=\s*)\$__interopRequire/g, '$1          require');

    params.sourceMap = traceurOptions.inputSourceMap ? compiler.getSourceMap() : undefined;
  },
};

function compile(params) {
  if (!params.next) {
    let _compiler = params.options['es6-compiler'] || 'buble';

    if (params.options.traceur) {
      _compiler = 'traceur';
    }

    if (params.options.babel) {
      _compiler = 'babel';
    }

    const opts = merge({}, typeof params.options[_compiler] === 'object' ? params.options[_compiler] : {});

    support[_compiler].call(this, params, opts);
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['es6', 'jsx'],
  requires: ['buble', 'babel-core', 'traceur'],
};
