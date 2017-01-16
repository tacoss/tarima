var path = require('path');

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

var support = {
  babel: function(params, opts) {
    var babel = this.babel;

    if (parseFloat(babel.version) < 6) {
      opts.blacklist = opts.blacklist || ['es6.modules'];
    }

    opts.filename = params.filename;
    opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;

    var output = babel.transform(params.source, opts);

    params.source = output.code;
    params.sourceMap = output.map;
  },
  buble: function(params, opts) {
    var buble = this.buble;

    opts.transforms = opts.transforms || {};
    opts.transforms.modules = false;
    opts.source = params.filename;
    opts.sourceMap = opts.sourceMap || params.options.compileDebug || false;

    var output = buble.transform(params.source, opts);

    params.source = output.code;
    params.sourceMap = output.map;
  },
  traceur: function(params, opts) {
    var traceurOptions = opts.traceur || {};

    traceurOptions.modules = opts.modules || 'commonjs';
    traceurOptions.inputSourceMap = traceurOptions.sourceMap || opts.compileDebug || false;

    var compiler = new this.traceur.NodeCompiler(traceurOptions);

    var ret = compiler.compile(params.source, path.basename(params.filename), params.filename, path.dirname(params.filename));

    params.source = new Buffer(ret).toString();
    params.sourceMap = traceurOptions.inputSourceMap ? compiler.getSourceMap() : undefined;
  },
};

function compile(params) {
  if (!params.next) {
    var compiler = params.options.traceur ? 'traceur' : params.options.babel ? 'babel' : 'buble';
    var opts = typeof params.options[compiler] === 'object' ? params.options[compiler] : {};

    support[compiler].call(this, params, opts);
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['es', 'es6', 'jsx'],
  requires: ['buble', 'babel-core', 'traceur'],
  render: compile,
  compile: compile
};
