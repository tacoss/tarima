'use strict';

const globalRe = /\/\*+\s*global\s+([\s\S]+?)\s*\*+\//g;

const tosource = require('tosource');

function toExpr(value) {
  if (/^-?\d+[.\d]*$/.test(value)) return value;
  if (value === 'false') return false;
  if (value === 'true') return true;
  if (value === 'null') return null;
  return tosource(value);
}

module.exports = (source, vars) => {
  const values = {};

  Object.keys(vars).forEach(prop => {
    values[prop] = typeof vars[prop] === 'function'
      ? String(vars[prop]()).trim()
      : toExpr(vars[prop]);
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
