'use strict';

const load = require('../../helpers/load');

function compile(params) {
  const cwd = params.options.cwd || process.cwd();
  const data = load(cwd, params.filename, params.source);

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
