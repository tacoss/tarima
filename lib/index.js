var fs = require('fs'),
    path = require('path'),
    tosource = require('tosource');

var $ = require('./util');

var tarima = module.exports = {};

var parsers = {
  js: function() {
    // just a dummy... this can be later
    // improved by other engines
    // like tarima-es6
  }
};

var reViews = /\.(hbs|jade|less|md|ract|ejs|idom|styl)/,
    reScripts = /\.((?:lit)?coffee(?:\.md)?|js|es6|imba|jisp)/,
    reTemplates = /^\s*(?:function.*?|Handlebars\.template)\(/,
    reModuleExports = /\b(?:module\.)?exports\s*=/;

var RENDER_KEY = '_render',
    LOCALS_KEY = '_locals';

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
  return isView(filename) || isScript(filename);
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
        if (locals.indexOf(key) === -1) {
          locals.push(key);
          context.push(values[key]);
        }
      });

      obj.source = '(function(' + locals.join(',') + '){' + obj.source + '}).call(' + context.join(',') + ');';
    }
  };
}

function partial(params) {
  var globals = params.options.data[LOCALS_KEY]
    ? $.merge({}, params.options.globals, params.options.data[LOCALS_KEY])
    : $.merge({}, params.options.globals);

  delete params.options.data[LOCALS_KEY];

  var ensureVars = buildGlobals(globals);

  function render(locals, raw) {
    locals = $.merge({}, params.options.data, locals);

    var tpl = $.reduce(parsers, $.copy(params), locals, raw);

    if (raw && params.options.exports && params.ext !== 'js') {
      tpl.source = wrap(JSON.stringify(tpl.source));
    }

    if (tpl.filepath && locals[RENDER_KEY]) {
      var src = path.join(tpl.filepath, locals[RENDER_KEY]);

      delete locals[RENDER_KEY];

      var sub = tarima.load(src).data($.merge({}, locals, { yield: tpl.source }));

      tpl.required = tpl.required || [];

      [src].concat(sub.required || []).forEach(function(dep) {
        if (tpl.required.indexOf(dep) === -1) {
          tpl.required.push(dep);
        }
      });

      if (sub.dependencies) {
        tpl.dependencies = ((tpl.dependencies || '') + '\n' + sub.dependencies).trim();
      }

      tpl.source = sub.source;
    }

    return tpl;
  }

  function test(cb) {
    try {
      return cb();
    } catch (e) {
      throw $.err(e, params);
    }
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
      return test(function() {
        return fix(render(locals, true)).source;
      });
    },

    render: function(locals) {
      return test(function() {
        return render(locals).source;
      });
    },

    data: function(locals, raw) {
      if (typeof locals === 'boolean') {
        raw = locals;
        locals = {};
      }

      // always fix the source
      return test(function() {
        return fix(render(locals, raw));
      });
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

  var params = $.options(src, options);

  params.source = String(code);
  params.options = options;

  var marker = (options.marker || '---').replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');

  var matches = code.match(new RegExp('(?:^|\\n)( +|)(' + marker + ')\\s*([\\s\\S]+?)\\s*\\2\\s*(?:$|\\n)'));

  if (matches) {
    params.source = params.source.replace(matches[0], (new Array(matches[0].split('\n').length)).join('\n'));
    params.options.data = $.yml(src, matches[3].replace(new RegExp('^\\s{' + matches[1].length + '}', 'gm'), ''), params);
  }

  params.keypath = params.options.cwd ? path.relative(params.options.cwd, path.join(params.filepath, params.name)) : params.name;

  if (typeof params.options.filter === 'function') {
    params.options.filter(params);
  }

  if (params.ext === 'es6' && params.parts[1] === 'js') {
    // finally restore the .js extension
    params.parts.unshift('js');
    params.ext = 'js';
  }

  if (['hbs', 'jade', 'less', 'idom'].indexOf(params.parts[1]) > -1) {
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
