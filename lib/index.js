'use strict';

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

var $ = require('./util');

var tarima = module.exports = {};

var parsers = {};

var engines = [
  require('./engines/coffee'),
  require('./engines/hbs'),
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

    return $.reduce(parsers, $.copy(params), locals, raw);
  }

  return {
    params: $.copy(params),

    compile: function(locals) {
      return render(locals, true).source;
    },

    render: function(locals) {
      return render(locals).source;
    },

    data: function(locals, raw) {
      if (typeof locals === 'boolean') {
        raw = locals;
        locals = {};
      }

      return render(locals, raw);
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
  code = code || '';

  if (!options) {
    options = {};
  }

  var params = $.options(src, options),
      keypath = params.name;

  var matches = code.match(/(?:^|\n)( +|)---\s*([\s\S]+?)\s*---\s*(?:$|\n)/);

  if (matches) {
    var data = matches[2].replace(new RegExp('^\\s{' + matches[1].length + '}', 'gm'), '');

    options.data = yaml.load(data);
  }

  $.defaults(params, {
    source: String(code),
    options: $.copy(options)
  });

  if (params.options.cwd) {
    keypath = path.relative(params.options.cwd, path.join(params.filepath, params.name));
  }

  params.keypath = keypath;

  if (typeof params.options.filter === 'function') {
    params.options.filter(params);
  }

  if (['hbs', 'jade', 'less'].indexOf(params.parts[1]) > -1) {
    params.dependencies = $.bundler.get(params.parts[1]);
  }

  return partial(params);
};

tarima.bundle = function(views, options) {
  return $.bundler.from(views, options);
};

tarima.engines = function() {
  return Object.keys(parsers);
};

engines.forEach(function(initialize) {
  initialize(tarima);
});
