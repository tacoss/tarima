(function () {
  'use strict';

  var _ = require('lodash'),
      toSource = require('tosource');

  var options = {
    coffee: {
      bare: true
    },
    jade: {
      compileDebug: false
    }
  };

  var defaults = _.partialRight(_.assign, function(a, b) {
    return typeof a === 'undefined' ? b : a;
  });


  var params_tpl = function(path) {
    var ext, name, parts, fullpath, filename;

    fullpath = path.split('/');
    filename = fullpath.pop();

    parts = filename.split('.');
    name = parts.shift();
    ext = parts.shift();

    return {
      filepath: fullpath.join('/'),
      filename: filename,
      parts: parts,
      name: name,
      ext: ext
    };
  };

  var defs_tpl = function(type, params) {
    var opts = {};

    defaults(opts, params);

    if (options[type]) {
      defaults(opts, options[type]);
    }

    return opts;
  };

  var debug_tpl = function(params, view) {
    return function() {
      try {
        return 'function' === typeof view ? view.apply(null, arguments) : view;
      } catch (e) {
        throw new Error('Compilation error for ' + params.filename + ' (' + e.message + ')');
      }
    };
  };

  var reduce_tpl = function(params, locals, raw) {
    params.precompile = raw;
    params.type = params.parts.pop();

    if (params.type || params.precompile) {
      params.render = parsers[params.type] ? debug_tpl(params, parsers[params.type])(params) : false;

      if (params.render) {
        params.source = debug_tpl(params, params.render)(locals);
        params = reduce_tpl(params, locals, params.precompile);
      }
    }

    return params;
  };


  function Partial(params) {
    this.params = params;
  }

  Partial.prototype.toSource = function() {
    var view = reduce_tpl(_.cloneDeep(this.params), null, true);

    return toSource(view.render || view.source, null, 0);
  };

  Partial.prototype.compile = function(locals) {
    var partial = reduce_tpl(_.cloneDeep(this.params), locals),
        view = 'function' === typeof partial.render ? partial.render(locals) : partial.source;

    return view;
  };


  var parsers = {};

  var from_source,
      register_engine;

  module.exports.add = register_engine = function(type, block) {
    parsers[type] = block;
  };

  module.exports.parse = from_source = function(path, source, options) {
    var params = params_tpl(path);

    defaults(params, {
      options: options || {},
      source: source
    });

    return new Partial(params);
  };

  module.exports.load = function(path, options) {
    try {
      return from_source(path, require('fs').readFileSync(path).toString(), options);
    } catch (e) {
      throw new Error(e.message);
    }
  };


  register_engine('ejs', function(params) {
    return require('ejs').compile(params.source, defs_tpl('ejs', params.options));
  });

  register_engine('eco', function(params) {
    return require('eco').compile(params.source, defs_tpl('eco', params.options));
  });

  register_engine('less', function(params) {
    var less = require('less'),
        parser = new less.Parser(defs_tpl('less', params.options)),
        compiled;

    parser.parse(params.source, function(e, tree) {
      compiled = tree.toCSS();
    });

    return compiled;
  });

  register_engine('ract', function(params) {
    return require('ractive').parse(params.source, defs_tpl('ractive', params.options));
  });

  register_engine('coffee', function(params) {
    return require('coffee-script').compile(params.source, defs_tpl('coffee', params.options));
  });

  register_engine('jade', function(params) {
    var jade = require('jade'),
        view;

    params.options.client = params.precompile;

    view = jade.compile(params.source, defs_tpl('jade', params.options));
    view = params.precompile ? toSource(view) : view;

    return view;
  });

  register_engine('hbs', function(params) {
    var method = params.precompile ? 'precompile' : 'compile';

    return require('handlebars')[method](params.source, defs_tpl('handlebars', params.options));
  });

  register_engine('us', function(params) {
    return _.template(params.source, null, defs_tpl('lodash', params.options));
  });

}).call(this);
