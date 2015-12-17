var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    tosource = require('tosource');

var $ = require('./util');

var tarima = module.exports = {};

var parsers = {};

var engines = [
  require('./engines/coffee'),
  require('./engines/hbs'),
  require('./engines/jade'),
  require('./engines/js'),
  require('./engines/less'),
  require('./engines/md'),
  require('./engines/ract'),
  require('./engines/ejs'),
  require('./engines/imba'),
  require('./engines/idom'),
  require('./engines/jisp'),
  require('./engines/styl')
];

function partial(params) {
  function render(locals, raw) {
    locals = $.merge({}, params.options.data, locals);

    return $.reduce(parsers, $.copy(params), locals, raw);
  }

  function fix(obj) {
    if (typeof obj.source === 'object') {
      obj.source = tosource(obj.source);
    }

    return obj;
  }

  return {
    params: $.copy(params),

    compile: function(locals) {
      return fix(render(locals, true)).source;
    },

    render: function(locals) {
      return render(locals).source;
    },

    data: function(locals, raw) {
      if (typeof locals === 'boolean') {
        raw = locals;
        locals = {};
      }

      // always fix the source
      return fix(render(locals, raw));
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

  var marker = (options.marker || '---').replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');

  var matches = code.match(new RegExp('(?:^|\\n)( +|)(' + marker + ')\\s*([\\s\\S]+?)\\s*\\2\\s*(?:$|\\n)'));

  if (matches) {
    var data = matches[3].replace(new RegExp('^\\s{' + matches[1].length + '}', 'gm'), '');

    options.data = yaml.load(data);

    code = code.replace(matches[0], '\n');
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

  if (params.ext === 'es6' && params.parts[1] === 'js') {
    // finally restore the .js extension
    params.parts.unshift('js');
    params.ext = 'js';
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
