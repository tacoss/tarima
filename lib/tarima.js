(function () {
  'use strict';

  var _ = require('lodash'),
      toSource = require('tosource');

  var options = {
    coffee: {
      bare: true
    },
    jade: {
      client: true,
      compileDebug: false
    }
  };

  var defaults = _.partialRight(_.assign, function(a, b) {
    return typeof a === 'undefined' ? b : a;
  });


  var params_tpl = function(path, locals, options) {
    var ext, name, parts;

    parts = path.split('/').pop().split('.');
    name = parts.shift();
    ext = parts.shift();

    return {
      locals: locals,
      options: options,
      filepath: path,
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

  var debug_tpl = function(path, block) {
    return function() {
      try {
        return block.apply(null, arguments);
      } catch (e) {
        throw new Error('Compilation error for ' + path + ' (' + e.message + ')');
      }
    };
  };

  var reduce_tpl = function(params, source) {
    if (!(params.type = params.parts.pop())) {
      return source;
    }

    source = parsers[params.type] ? parsers[params.type](source, params.options) : source;

    if (params.parts.length > 0) {
      source = source(params.locals);
      source = reduce_tpl(params, source);
    }

    if (!source.source) {
      source.source = toSource(source, null, 0);
    }

    source.params = params;

    return source;
  };


  var parsers = {};

  var register_engine;

  exports.add = register_engine = function(type, block) {
    parsers[type] = block;
  };

  exports.parse = function(path, source, options) {
    return function(locals) {
      var params = params_tpl(path, locals, options),
          partial = reduce_tpl(params, source);

      return partial;
    };
  };

  exports.load = function(path, options) {
    return function(locals) {
      var params = params_tpl(path, locals, options),
          source, partial;

      try {
        source = require('fs').readFileSync(path).toString();
        partial = reduce_tpl(params, source);
      } catch (e) {
        throw new Error(e.message);
      }

      return partial;
    };
  };


  register_engine('ejs', function(src, opts) {
    return require('ejs').compile(src, defs_tpl('ejs', opts));
  });

  register_engine('eco', function(src, opts) {
    return require('eco').compile(src, defs_tpl('eco', opts));
  });

  register_engine('less', function(src, opts) {
    var less = require('less'),
        parser = new less.Parser(defs_tpl('less', opts)),
        compiled;

    parser.parse(src, function(e, tree) {
      compiled = tree.toCSS();
    });

    return compiled;
  });

  register_engine('ract', function(src, opts) {
    return require('ractive').parse(src, defs_tpl('ractive', opts));
  });

  register_engine('coffee', function(src, opts) {
    return require('coffee-script').compile(src, defs_tpl('coffee', opts));
  });

  register_engine('jade', function(src, opts) {
    return require('jade').compile(src, defs_tpl('jade', opts));
  });

  register_engine('hbs', function(src, opts) {
    return require('handlebars').compile(src, defs_tpl('handlebars', opts));
  });

  register_engine('us', function(src, opts) {
    return _.template(src, null, defs_tpl('lodash', opts));
  });

}).call(this);
