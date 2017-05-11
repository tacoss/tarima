'use strict';

const tosource = require('tosource');

function compile(params) {
  if (!params.next || params.next === 'js') {
    const Ractive = this.ractive;

    params.source = `function () {
      return ${tosource(Ractive.parse(params.source))};
    }`;
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['ract', 'rv', 'ract.pug', 'rv.pug'],
  requires: ['ractive'],
};
