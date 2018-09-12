'use strict';

function compile(params) {
  const isJSON = require('..').isJSON;

  if (!params.next && !isJSON(params.source)) {
    const prefix = params._import ? 'export default' : 'module.exports =';
    const data = JSON.stringify(params.source);

    params.source = `${prefix} ${data}`;
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['json'],
};
