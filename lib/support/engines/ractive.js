var tosource = require('tosource');

function factory(client) {
  return function(params) {
    var Ractive = this.ractive;
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
  support: ['ract', 'rv'],
  requires: ['ractive'],
  render: factory(),
  compile: factory(true)
};
