'use strict';

const load = require('../../helpers/load');
const tosource = require('tosource');

function compile(params) {
  const data = load(params.filename, params.source);

  data.src.forEach(x => {
    params.deps.push(x);
  });

  params.source = tosource(data.obj);
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['yml', 'yaml'],
};
