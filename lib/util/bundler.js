'use strict';

var path = require('path');

var deps = {
  hbs: 'require("handlebars/runtime")["default"]',
  jade: 'require("jade/runtime")'
};

var bundle = ['json', 'less', 'ract', 'jade', 'hbs', 'ejs'];

var wrappers = {
  cjs: function(code) {
    return code + '\nmodule.exports = JST;';
  }
};

function from(views, options) {
  options = options || {};

  var code = [],
      all = [];

  code.push('var JST = {};');

  views.forEach(function(tpl) {
    if (bundle.indexOf(tpl.params.parts[1]) === -1) {
      return;
    }

    if (tpl.params.dependencies && all.indexOf(tpl.params.dependencies) === -1) {
      all.push(tpl.params.dependencies);
    }

    var output = tpl.compile(options.locals);

    code.push('/* ' + path.join(tpl.params.filepath, tpl.params.filename) + ' */');
    code.push('JST["' + tpl.params.keypath + '"] = ' + (output.trim() || 'null') + ';');
  });

  code.unshift(all.join('\n'));
  code = code.join('\n');

  var wrapper = typeof options.wrapper === 'string' ? wrappers[options.wrapper] : options.wrapper;

  if (typeof wrapper === 'function') {
    code = wrapper(code);
  }

  return code;
}

function get(type) {
  var context = "(typeof window !== 'undefined' ? window : global)",
      fixed = deps[type] || 'require("' + type + '")';

  if (type === 'less' || type === 'jade') {
    return 'var ' + type + ' = ' + context + '.' + type + ' || ' + fixed + ';';
  } else {
    return 'var Handlebars = ' + context + '.Handlebars || ' + fixed + ';';
  }
}

module.exports = {
  from: from,
  get: get
};
