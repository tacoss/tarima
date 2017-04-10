'use strict';

const globalRe = /\/\*+\s*global\s+([\s\S]+?)\s*\*+\//g;

const tosource = require('tosource');

module.exports = (source, vars) => {
  const values = {};

  Object.keys(vars).forEach(prop => {
    values[prop] = typeof vars[prop] === 'function'
      ? String(vars[prop]()).trim()
      : tosource(vars[prop]);
  });

  return source
    .replace(globalRe, (_, sub) => {
      const out = [];

      sub.split(/[\s,]+/).forEach(k => {
        if (typeof values[k] !== 'undefined') {
          out.push(`${k}=${values[k]}`);
        }
      });

      return out.length ? `var ${out.join(', ')};` : '';
    });
};
