'use strict';

var fs = require('fs'),
    path = require('path'),
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

var reViews = /\.(hbs|jade|less|md|ract|ejs|idom|styl)/,
    reScripts = /\.((?:lit)?coffee(?:\.md)?|js|es6|imba|jisp)/,
    reTemplates = /^\s*(?:function.*?|Handlebars\.template)\(/,
    reModuleExports = /\b(?:module\.)?exports\s*=/;

var RENDER_KEY = '_render';

function nope() {
  // :)
}

function wrap(code) {
  return 'module.exports = ' + code.trim() + ';' ;
}

function isView(src) {
  return reViews.test(src)
    // test for .coffee due lack of look-behind support
    && (src.indexOf('.coffee') === -1);
}

function isScript(src) {
  return reScripts.test(src)
    // ignore precompiled views
    && !isView(src);
}

function isTemplate(code) {
  return reTemplates.test(code)
    && !reModuleExports.test(code);
}

function isSupported(filename) {
  return filename.split('.').slice(1).filter(function(ext) {
    return typeof parsers[ext] !== 'undefined';
  }).length;
}

function ensureWrapper(view) {
  if (isTemplate(view.source)) {
    view.source = ((view.dependencies || '') + '\n' + wrap(view.source)).trim();
  }
}

function buildGlobals(vars) {
  var keys = vars ? Object.keys(vars) : [],
      values = {};

  if (!keys.length) {
    return nope;
  }

  var regex = new RegExp(keys.map(function(key) {
      return '\\b' + key + '\\b';
    }).join('|'), 'g');

  keys.forEach(function(key) {
    values[key] = tosource(vars[key]);
  });

  return function(obj) {
    if (regex.test(obj.source)) {
      var locals = [],
          context = ['this'];

      obj.source.match(regex).forEach(function(key) {
        locals.push(key);
        context.push(values[key]);
      });

      obj.source = '(function(' + locals.join(',') + '){' + obj.source + '}).call(' + context.join(',') + ');';
    }
  };
}

function partial(params) {
  var ensureVars = buildGlobals(params.options.globals);

  function render(locals, raw) {
    locals = $.merge({}, params.options.data, locals);

    var view = $.reduce(parsers, $.copy(params), locals, raw);

    if (raw && params.options.exports && params.ext !== 'js') {
      view.source = wrap(JSON.stringify(view.source));
    }

    if (view.filepath && locals[RENDER_KEY]) {
      var tpl = locals[RENDER_KEY],
          src = path.join(view.filepath, tpl);

      delete locals[RENDER_KEY];

      var sub = tarima.load(src).data($.merge({}, locals, { yield: view.source }));

      view.required = view.required || [];

      [src].concat(sub.required || []).forEach(function(dep) {
        if (view.required.indexOf(dep) === -1) {
          view.required.push(dep);
        }
      });

      if (sub.dependencies) {
        view.dependencies = ((view.dependencies || '') + '\n' + sub.dependencies).trim();
      }

      view.source = sub.source;
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

    if (isScript(params.filename)) {
      ensureVars(obj);
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
    code = code.replace(matches[0], '');
    options.data = $.yml(src, matches[3].replace(new RegExp('^\\s{' + matches[1].length + '}', 'gm'), ''));
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

tarima.util = {
  isView: isView,
  isScript: isScript,
  isTemplate: isTemplate,
  isSupported: isSupported
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
