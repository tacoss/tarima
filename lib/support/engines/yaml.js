'use strict';

const load = require('../../helpers/load');

function compile(params) {
  const data = load(params.filename, params.source);

  data.src.forEach(x => {
    params.deps.push(x);
  });

  params.source = JSON.stringify(data.obj, null, 2);
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['yml', 'yaml'],
};
