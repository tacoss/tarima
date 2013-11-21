(function () {
  'use strict';

  var _ = require('lodash');

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
    var type;

    if (!(type = params.parts.pop())) {
      return source;
    }

    source = parsers[type] ? parsers[type](source, params.options) : source;

    if (params.parts.length > 0) {
      source = source(params.locals);
      source = reduce_tpl(params, source);
    }

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
