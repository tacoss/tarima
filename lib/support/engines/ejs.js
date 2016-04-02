var $ = require('../../helpers/resolve');

var ejs;

function render(client) {
  return function(params) {
    ejs = ejs || require($('ejs'));

    var opts = {};

    opts.client = client;
    opts.filename = params.filename;

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
