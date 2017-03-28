'use strict';

const merge = require('../../helpers/merge');

function render(params) {
  const opts = merge({}, params.options.pug || {});

  opts.cache = false;
  opts.filename = params.filename;

  const tpl = this.pug.compile(params.source, opts);

  params.source = tpl(params.locals);
  params.deps = params.deps.concat(tpl.dependencies);
}

function compile(params) {
  const method = params.options.client ? 'compileClientWithDependenciesTracked' : 'compile';
  const opts = merge({}, params.options.pug || {});

  let tpl;

  opts.cache = true;
  opts.pretty = true;
  opts.filename = params.filename;
  opts.inlineRuntimeFunctions = false;
  opts.compileDebug = params.options.compileDebug;

  if (params.options.client && (opts.sourceMap || opts.compileDebug)) {
    // required
    opts.compileDebug = true;

    tpl = this.pug.compileClientWithDependenciesTracked(params.source, opts);

    const result = this.genPugSourceMap(params.filename, tpl.body);

    params.source = result.data;
    params.sourceMap = result.map;
  } else {
    tpl = this.pug[method](params.source, opts);

    params.source = tpl.toString();
  }

  params.deps = params.deps.concat(tpl.dependencies);
}

module.exports = {
  render,
  compile,
  ext: 'html',
  type: 'template',
  support: ['pug', 'jade'],
  requires: ['pug', 'gen-pug-source-map'],
  included: "var pug=pug||(typeof window!=='undefined'?window:global).pug||require('p'+'ug-runtime');",
};
