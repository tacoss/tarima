'use strict';

const support = require('../../support');

function noop(params) {
  if (!support.isJSON(params.source)) {
    params.source = JSON.stringify(params.source);
  }
}

module.exports = {
  ext: 'json',
  type: 'script',
  support: ['json'],
  requires: [],
  render: noop,
  compile: noop,
};
