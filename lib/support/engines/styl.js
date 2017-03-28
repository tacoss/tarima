'use strict';

function render(params) {
  if (!params.next || params.next === 'css') {
    params.source = this.styl(params.source).toString();
  }
}

module.exports = {
  render,
  compile: render,
  ext: 'css',
  type: 'template',
  support: ['styl'],
  requires: ['styl'],
};
