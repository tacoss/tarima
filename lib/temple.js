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


  var params_tpl = function(str) {
    var ext, name, parts;

    parts = str.split('.');
    name = parts.shift();
    ext = parts.shift();

    return {
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

    source = parsers[type] ? parsers[type](source, params) : source;

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

  exports.parse = function(path, source) {
    return function(locals) {
      var params;

      params = params_tpl(path);
      params.filename = path;
      params.locals = locals;

      return reduce_tpl(params, source);
    };
  };

  exports.load = function(path) {
    return function(locals) {
      var params;

      params = params_tpl(path);
      params.filename = path;
      params.locals = locals;

      try {
        return reduce_tpl(params, require('fs').readFileSync(path).toString());
      } catch (e) {
        throw new Error(e.message);
      }
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
