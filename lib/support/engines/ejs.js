'use strict';

function render(params) {
  const opts = {};

  opts.filename = params.filename;

  params.source = this.ejs.render(params.source, opts);
}

function compile(params) {
  const opts = {};

  opts.debug = false;
  opts.client = params.options.client;
  opts.filename = params.filename;
  opts.compileDebug = params.options.compileDebug || false;

  const tpl = this.ejs.compile(params.source, opts);

  params.source = tpl.toString();
}

module.exports = {
  render,
  compile,
  ext: 'html',
  type: 'template',
  support: ['ejs'],
  requires: ['ejs'],
};
