var $ = require('../helpers/resolve');

var ejs;

function render(client) {
  return function(params, cb) {
    ejs = ejs || require($('ejs'));

    var opts = {};

    opts.client = client;
    opts.filename = params.src;

    var tpl = ejs.compile(params.code, opts);

    var code;

    if (!opts.client) {
      code = tpl(params.locals);
    } else {
      code = tpl.toString();
    }

    cb(null, {
      out: code
    });
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['ejs'],
  required: ['ejs'],
  render: render(),
  compile: render(true)
};
