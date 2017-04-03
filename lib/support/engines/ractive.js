'use strict';

const tosource = require('tosource');

function render(params) {
  const Ractive = this.ractive;

  Ractive.DEBUG = false;

  params.source = new Ractive({
    template: params.source,
    data: params.locals,
  }).toHTML();
}

function compile(params) {
  if (!params.next || params.next === 'js') {
    const Ractive = this.ractive;

    params.source = `function () {
      return ${tosource(Ractive.parse(params.source))};
    }`;
  }
}

module.exports = {
  render,
  compile,
  ext: 'js',
  support: ['ract', 'rv'],
  requires: ['ractive'],
};
