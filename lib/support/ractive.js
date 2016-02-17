var tosource = require('tosource');

var $ = require('../helpers/resolve');

var Ractive;

function factory(client) {
  return function(params, cb) {
    Ractive = Ractive || require($('ractive'));
    Ractive.DEBUG = false;

    var tpl;

    if (!client) {
      tpl = new Ractive({
        template: params.code,
        data: params.locals
      }).toHTML();
    } else {
      tpl = 'function(){return' + tosource(Ractive.parse(params.code)) + '}';
    }

    cb(null, {
      out: tpl
    });
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['ract'],
  required: ['ractive'],
  render: factory(),
  compile: factory(true)
};
