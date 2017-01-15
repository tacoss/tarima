function render(client) {
  return function(params) {
    var ejs = this.ejs;
    var opts = {};

    opts.debug = false;
    opts.client = client;
    opts.filename = params.filename;
    opts.compileDebug = params.options.compileDebug || false;

    var tpl = ejs.compile(params.source, opts);

    if (!opts.client) {
      params.source = tpl(params.locals);
    } else {
      params.source = tpl.toString();
    }
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['ejs'],
  requires: ['ejs'],
  render: render(),
  compile: render(true)
};
