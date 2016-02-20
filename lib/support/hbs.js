var $ = require('../helpers/resolve');

var Handlebars;

function render(client) {
  return function(params, cb) {
    Handlebars = Handlebars || require($('handlebars'));

    var options = {};

    options.compile = options.compile || {};
    options.compile.srcName = params.src;

    var method = client ? 'precompile' : 'compile',
        tpl = Handlebars[method](params.code, options);

    var code;

    if (!client) {
      code = tpl(params.locals);
    } else {
      code = 'Handlebars.template(' + tpl.toString() + ')';
    }

    cb(null, {
      out: code
    });
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['hbs'],
  requires: ['handlebars'],
  render: render(),
  compile: render(true),
  included: "var Handlebars=(typeof window!=='undefined'?window:global).Handlebars||require('h'+'andlebars/runtime')['default'];"
};
