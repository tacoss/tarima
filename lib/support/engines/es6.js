var _ = {};

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

function compile(params) {
  if (!params.next) {
    var compiler = params.options.babel ? 'babel-core' : 'buble',
        props = params.options.babel ? 'babel' : 'buble';

    var opts = typeof params.options[props] === 'object' ? params.options[props] : {};

    _[compiler] = _[compiler] || require(compiler);

    if (props === 'babel' && parseFloat(_[compiler].version) < 6) {
      opts.blacklist = opts.blacklist || ['es6.modules'];
    }

    if (props === 'buble') {
      opts.transforms = opts.transforms || {};
      opts.transforms.modules = false;
      opts.source = params.filename;
    } else {
      opts.filename = params.filename;
    }

    params.source = _[compiler].transform(params.source, opts).code;
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['es', 'es6', 'jsx'],
  requires: ['buble', 'babel-core@^5'],
  render: compile,
  compile: compile
};
