'use strict';

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    tosource = require('tosource');

var $ = require('./util');

var tarima = module.exports = {};

var parsers = {};

var engines = [
  require('./engines/coffee'), // script
  require('./engines/hbs'),    // view
  require('./engines/jade'),   // view
  require('./engines/js'),     // script
  require('./engines/less'),   // view
  require('./engines/md'),     // view
  require('./engines/ract'),   // view
  require('./engines/ejs'),    // view
  require('./engines/imba'),   // script
  require('./engines/idom'),   // view
  require('./engines/jisp'),   // script
  require('./engines/styl')    // view
];

function isView(src) {
  return /\.(hbs|jade|less|md|ract|ejs|idom|styl)/.test(src)
    // test for .coffee due lack of look-behind support
    && (src.indexOf('.coffee') === -1);
}

function isScript(src) {
  return /\.((?:lit)?coffee(?:\.md)?|js|es6|imba|jisp)/.test(src)
    // ignore precompiled views
    && !isView(src);
}

function hasExports(code) {
  return /\b(?:module\.)?exports\s*=/.test(code);
}

function isTemplate(code) {
  return /^\s*(?:function.*?|Handlebars\.template)\(/.test(code)
    && !hasExports(code);
}

function ensureWrapper(view) {
  if (isTemplate(view.source)) {
    view.source = [
      view.dependencies || '',
      'module.exports = ' + view.source + ';'
    ].join('\n');
  }
}

function buildGlobals(vars) {
  var keys = Object.keys(vars);

  return {
    regex: new RegExp(keys.map(function(key) {
      return '\\b' + key + '\\b';
    }).join('|')),
    from: keys.join(),
    to: keys.map(function(key) {
      return JSON.stringify(vars[key]);
    }).join()
  };
}

function partial(params) {
  var globalVars = params.options.globals && buildGlobals(params.options.globals);

  function hasVars(source) {
    return globalVars && globalVars.regex.test(source);
  }

  function render(locals, raw) {
    locals = $.merge({}, params.options.data, locals);

    var view = $.reduce(parsers, $.copy(params), locals, raw);

    if (raw && params.options.exports && !(hasExports(view.source) || (params.ext === 'js'))) {
      view.source = 'module.exports = ' + JSON.stringify(view.source) + ';';
    }

    return view;
  }

  function fix(obj) {
    if (typeof obj.source === 'object') {
      obj.source = tosource(obj.source);
    }

    if (params.options.exports) {
      ensureWrapper(obj);
    }

    if (isScript(params.filename) && hasVars(obj.source)) {
      var context = 'this' + (globalVars.to ? ',' + globalVars.to : '');

      obj.source = '(function(' + globalVars.from + '){' + obj.source + '}).call(' + context + ');';
    }

    return obj;
  }

  return {
    params: params,

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
    options: options
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

tarima.util = {
  isView: isView,
  isScript: isScript,
  isTemplate: isTemplate
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
