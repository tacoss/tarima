const tosource = require('tosource');

function makeRe(key) {
  return new RegExp(`\\/\\*+\\s*${key}\\s+([\\s\\S]+?)\\s*\\*+\\/`, 'g');
}

module.exports = (params, vars, key) => {
  const values = {};

  Object.keys(vars).forEach((prop) => {
    values[prop] = typeof vars[prop] === 'function'
      ? String(vars[prop]()).trim()
      : tosource(vars[prop]);
  });

  const regexp = makeRe(key);

  params.source = params.source
    .replace(regexp, (_, sub) => {
      const out = [];

      sub.split(/[\s,]+/).forEach((k) => {
        if (typeof values[k] !== 'undefined') {
          out.push(`${k}=${values[k]}`);
        }
      });

      return out.length ? `var ${out.join(',\n')};\n` : '';
    });
};
