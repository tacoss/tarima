var tosource = require('tosource');

var $ = require('../helpers/resolve');

var Ractive;

function factory(client) {
  return function(params) {
    Ractive = Ractive || require($('ractive'));
    Ractive.DEBUG = false;

    if (!client) {
      params.source = new Ractive({
        template: params.source,
        data: params.locals
      }).toHTML();
    } else {
      params.source = 'function(){return' + tosource(Ractive.parse(params.source)) + '}';
    }
  };
}

module.exports = {
  ext: 'html',
  type: 'template',
  support: ['ract'],
  requires: ['ractive'],
  render: factory(),
  compile: factory(true)
};
