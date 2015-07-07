'use strict';

var path = require('path');

var deps = {
  hbs: 'require("handlebars/runtime")["default"]',
  jade: 'require("jade/runtime")'
};

function from(views, locals) {
  var code = [],
      all = [];

  code.push('var JST = module.exports = {};');

  views.forEach(function(tpl) {
    if (tpl.params.dependencies && all.indexOf(tpl.params.dependencies) === -1) {
      all.push(tpl.params.dependencies);
    }

    var output = tpl.compile(locals);

    code.push('/* ' + path.join(tpl.params.filepath, tpl.params.filename) + ' */');
    code.push('JST["' + tpl.params.keypath + '"] = ' + (output.trim() || 'null') + ';');
  });

  code.unshift(all.join('\n'));

  return code.join('\n');
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
