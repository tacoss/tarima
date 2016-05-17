var Handlebars;

function render(client) {
  return function(params) {
    Handlebars = Handlebars || require('handlebars');

    var options = {};

    options.compile = options.compile || {};
    options.compile.srcName = params.filename;

    var method = client ? 'precompile' : 'compile',
        tpl = Handlebars[method](params.source, options);

    if (!client) {
      params.source = tpl(params.locals);
    } else {
      params.source = 'Handlebars.template(' + tpl.toString() + ')';
    }
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['hbs'],
  requires: ['handlebars'],
  render: render(),
  compile: render(true),
  included: "var Handlebars=Handlebars||(typeof window!=='undefined'?window:global).Handlebars||require('h'+'andlebars/runtime')['default'];"
};
