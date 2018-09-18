'use strict';

function compile(params) {
  const isJSON = require('..').isJSON;

  if (!isJSON(params.source)) {
    params.source = JSON.stringify(params.source);
  }

  if (params._import) {
    params.source = `export default ${params.source}`;
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'json',
  support: ['json'],
};
