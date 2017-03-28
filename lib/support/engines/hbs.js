'use strict';

function render(params) {
  const tpl = this.handlebars.compile(params.source, params.options.handlebars || {});

  params.source = tpl(params.locals);
}

function compile(params) {
  const opts = {};

  opts.compile = opts.compile || {};
  opts.compile.srcName = params.filename;

  const tpl = this.handlebars.precompile(params.source, opts);

  params.source = `Handlebars.template(${tpl.toString()})`;
}

module.exports = {
  render,
  compile,
  ext: 'html',
  type: 'template',
  support: ['hbs'],
  requires: ['handlebars'],
  included: "var Handlebars=Handlebars||(typeof window!=='undefined'?window:global).Handlebars||require('h'+'andlebars/runtime')['default'];",
};
