'use strict';

const path = require('path');

const merge = require('./merge');
const parse = require('./parse');
const render = require('./render');
const support = require('../support');

const reImport = /\bimport\s+(?:(.+?)\s+from\s+)?((['"])[^\2\s;]+\2)/g;
const reExport = /\bexport\s+((?:\w+\s+){1,3})/g;

const reSplitAs = /\s+as\s+/;
const reProps = /(\w+)\s+as\s+(\w+)/g;
const reVars = /\s*,\s*/g;
const reCleanVars = /\{\s*\}/;

let inc = 0;
let fsbx;

function id(str, hide) {
  return (hide ? `$_${inc++}` : '') + str.split('/').pop().replace(/\.\w+|\W/g, '');
}

function refs(str, ref) {
  const props = str.match(reProps);
  const out = [];

  if (props) {
    props.forEach(x => {
      const parts = x.split(reSplitAs);

      out.push(`${parts[1]} = ${ref}.${parts[0]}`);
    });
  }

  const vars = str.replace(reProps, '')
    .replace(reCleanVars, '').split(reVars);

  vars.forEach(x => {
    if (x && x.indexOf('{') === -1 && x.indexOf('}') === -1) {
      out.push(`${x} = (${ref}.default || ${ref})`);
    } else if (x) {
      out.push(`${id(x)} = ${ref}.${id(x)}`);
    }
  });

  return out;
}

function replaceImport(_, $1, $2) {
  if (!$1) {
    return `require(${$2})`;
  }

  if ($1.indexOf(',') === -1 && $1.indexOf(' as ') === -1) {
    if ($1.indexOf('{') === -1 && $1.indexOf('}') === -1) {
      return `var ${$1.replace('*', id($2))} = require(${$2}).${id($1)}`;
    }

    return `var ${id($1)} = require(${$2}).${id($1)}`;
  }

  if ($1.indexOf('* as ') === -1) {
    const ref = id($2, true);

    return `var ${ref} = require(${$2}), ${refs($1, ref).join(', ')};`;
  }

  return `var ${$1.replace('* as ', '')} = require(${$2})`;
}

function replaceExport(_, words) {
  words = words.trim().split(/\s+/);

  let prefix = 'module.exports';

  if (words[0] === 'default') {
    prefix = `${prefix} = ${words.slice(1).join(' ')} `;
  } else {
    prefix += `.${words[0]} = ${words.slice(1).join(' ')} `;
  }

  return prefix;
}

module.exports = (options, params, done) => {
  /* eslint-disable import/no-unresolved */
  /* eslint-disable global-require */
  fsbx = fsbx || require('fuse-box');

  const opts = merge({}, options['fuse-box'] || options.fusebox || {});
  // const exts = support.getExtensions();
  const deps = [];

  if (opts.external) {
    (Array.isArray(opts.external)
      ? opts.external
      : opts.external.split(/\W/))
      .forEach(dep => {
        deps.push(`+${dep}`);
      });
  }

  fsbx.FuseBox.init({
    log: false,
    homeDir: path.dirname(params.filename),
    standalone: typeof opts.standalone === 'undefined' ? true : opts.standalone,
    plugins: [{
      limit2project: false,
      test: support.getExtensions(true),
      init(context) {
        support.getExtensions().forEach(ext => {
          context.allowExtension(ext);
        });
      },
      transform(file) {
        file.loadContents();

        const sub = parse(file.info.absPath, file.contents.toString(), params.options);

        if (!sub.isScript && sub.parts[0] !== 'js') {
          sub.parts.unshift('js');
        }

        sub._import = true;

        return new Promise((resolve, reject) => {
          render(sub, (err, result) => {
            if (err) {
              reject(err);
            } else {
              file.contents = result.source
                .replace(reImport, replaceImport)
                .replace(reExport, replaceExport);

              resolve(file.contents);
            }
          });
        });
      },
    }],
  }).bundle(`> ${path.basename(params.filename)} [**/*.*] ${deps.join(' ')}`)
  .then(result => {
    params.source = result.content.toString();
    done();
  })
  .catch(done);
};
