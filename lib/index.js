'use strict';

var fs = require('fs'),
    path = require('path'),
    frontMatter = require('front-matter');

var $ = require('./util');

var tarima = module.exports = {};

var parsers = {};

var engines = [
  require('./engines/coffee'),
  require('./engines/css'),
  require('./engines/hbs'),
  require('./engines/html'),
  require('./engines/jade'),
  require('./engines/js'),
  require('./engines/json'),
  require('./engines/less'),
  require('./engines/md'),
  require('./engines/ract'),
  require('./engines/ejs')
];

function partial(params) {
  function render(locals, raw) {
    locals = $.merge({}, params.options.data, locals);

    var view = $.reduce(parsers, $.copy(params), locals, raw);

    if (typeof view.render === 'function') {
      view = view.render(locals);
    } else {
      view = view.source;
    }

    return view;
  }

  return {
    params: $.copy(params),

    compile: function(locals) {
      return render(locals, true);
    },

    render: function(locals) {
      return render(locals);
    }
  };
}

tarima.add = function(engine, callback) {
  parsers[engine] = callback;
};

tarima.load = function(src, options) {
  return tarima.parse(src, fs.readFileSync(src).toString(), options);
};

tarima.parse = function(src, code, options) {
  var params = $.options(src),
      key = params.name;

  code = code || '';

  if (!options) {
    options = {};
  }

  var last = params.parts[params.parts.length - 1];

  if (['md', 'ejs', 'hbs', 'jade', 'ract'].indexOf(last) > -1) {
    var data = frontMatter(code);

    code = data.body;

    options.data = data.attributes;
  }

  $.defaults(params, {
    source: String(code),
    options: $.copy(options)
  });

  if (params.options.cwd) {
    key = path.join(path.relative(params.options.cwd, params.filepath), params.name);
  }

  params.keypath = key;

  return partial(params);
};

engines.forEach(function(initialize) {
  initialize(tarima);
});
