'use strict';

const path = require('path');

const parse = require('./parse');
const render = require('./render');
const support = require('../support');

let fsbx;

// const re_import = /\bimport\s+(?:(.+?)\s+from\s+)?((['"])[^\2;]+\2)\s*;?/g;
// const re_export = /\bexport\s+(?:(?:(\w+)\s+){1,2})?\s*(\w+)?/g;

// const re_split_as = /\s+as\s+/;
// const re_props = /(\w+)\s+as\s+(\w+)/g;
// const re_vars = /\s*,\s*/g;
// const re_clean_vars = /\{\s*\}/;
// const re_scope = /___scope___\.file\("(.+?)"/g;

// const require_prefix = 'require';

// var inc = 0;

// function id(str, hide) {
//   return (hide ? ('$_' + inc++) : '') + str.split('/').pop().replace(/\.\w+|\W/g, '');
// }

// function refs(str, ref) {
//   var out = [];

//   var props = str.match(re_props);

//   if (props) {
//     props.forEach(function(x) {
//       var parts = x.split(re_split_as);

//       out.push(parts[1] + ' = ' + ref + '.' + parts[0]);
//     });
//   }

//   var vars = str.replace(re_props, '')
//     .replace(re_clean_vars, '').split(re_vars);

//   vars.forEach(function(x) {
//     if (x && x.indexOf('{') === -1 && x.indexOf('}') === -1) {
//       out.push(x + ' = (' + ref + '.default || ' + ref + ')');
//     } else if (x) {
//       out.push(id(x) + ' = ' + ref + '.' + id(x));
//     }
//   });

//   return out;
// }

// function replaceImport(_, $1, $2) {
//   if (!$1) {
//     return require_prefix + '(' + $2 + ');';
//   }

//   if ($1.indexOf(',') === -1 && $1.indexOf(' as ') === -1) {
//     if ($1.indexOf('{') === -1 && $1.indexOf('}') === -1) {
//       return 'var ' + $1.replace('*', id($2)) + ' = ' + require_prefix + '(' + $2 + ');';
//     }

//     return 'var ' + id($1) + ' = ' + require_prefix + '(' + $2 + ').' + id($1) + ';';
//   }

//   if ($1.indexOf('* as ') === -1) {
//     var ref = id($2, true);

//     return 'var ' + ref + ' = ' + require_prefix + '(' + $2 + '), ' + refs($1, ref).join(', ') + ';';
//   }

//   return 'var ' + $1.replace('* as ', '') + ' = ' + require_prefix + '(' + $2 + ');';
// }

// function replaceExport(_, $1, $2) {
//   var prefix = 'module.exports';

//   if ($1 === 'default') {
//     if (!$2) {
//       return prefix + '.' + $1 + ' = ';
//     }

//     prefix += ' = ' + $2;
//   }

//   if ($1 && !$2 || $1 === 'function') {
//     prefix += '.' + ($2 || $1) + ' ';

//     if ($1 === 'function') {
//       prefix += '= ' + $1 + ' ' + $2;
//     }
//   }

//   if (!$1) {
//     prefix += ($2 ? '.' + $2 : '') + ' = ' + ($2 || '');
//   }

//   return prefix;
// }

// function rewrite(code) {
//   code = code.replace(re_import, replaceImport);
//   code = code.replace(re_export, replaceExport);

//   return code;
// }

module.exports = (options, params, done) => {
  /* eslint-disable global-require */
  fsbx = fsbx || require('fuse-box');

  const exts = support.getExtensions();

  fsbx.FuseBox.init({
    log: false,
    homeDir: path.dirname(params.filename),
    outFile: './bundle.js',
    plugins: [{
      test: new RegExp(`\\.(?:${exts
        .map(ext => ext.replace(/^\./, ''))
        .join('|')
        .replace(/\./g, '\\.')
      })$`),
      transform(file) {
        file.loadContents();

        const sub = parse(file.info.absPath, file.contents.toString(), params.options);

        if (sub.parts[0] !== 'js') {
          sub.parts.unshift('js');
        }

        sub._import = true;

        return render(sub, (err, result) => {
          // file.contents = rewrite(result.source);
          file.contents = result.source;
          return file.contents;
        });
      },
    }],
  }).bundle(`> ${path.basename(params.filename)}`)
  .then(result => {
    params.source = result.contentParts.join('');

    // if (params.source.match(re_scope)) {
    //   params.source = params.source.replace(re_scope, (_, $1) => {
    //     if ($1 !== 'default.js') {
    //       // FIXME
    //       return `___scope___.file("${`/${$1}`}"`;
    //     }

    //     return _;
    //   });
    // }

    done();
  })
  .catch(done);
};
