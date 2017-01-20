var path = require('path');

var _render = require('./_render'),
    support = require('../support');

var fsbx;

var re_import = /\bimport\s+(?:(.+?)\s+from\s+)?((['"])[^\2;]+\2)\s*;?/g;
var re_export = /\bexport\s+(?:(?:(\w+)\s+){1,2})?\s*(\w+)?/g;

var re_split_as = /\s+as\s+/;
var re_props = /(\w+)\s+as\s+(\w+)/g;
var re_vars = /\s*,\s*/g;
var re_clean_vars = /\{\s*\}/;

var require_prefix = 'FuseBox.import';

var inc = 0;

function id(str, hide) {
  return (hide ? ('$_' + inc++) : '') + str.split('/').pop().replace(/\.\w+|\W/g, '');
}

function refs(str, ref) {
  var out = [];

  var props = str.match(re_props);

  if (props) {
    props.forEach(function(x) {
      var parts = x.split(re_split_as);

      out.push(parts[1] + ' = ' + ref + '.' + parts[0]);
    });
  }

  var vars = str.replace(re_props, '')
    .replace(re_clean_vars, '').split(re_vars);

  vars.forEach(function(x) {
    if (x && x.indexOf('{') === -1 && x.indexOf('}') === -1) {
      out.push(x + ' = ' + ref);
    } else if (x) {
      out.push(id(x) + ' = ' + ref + '.' + id(x));
    }
  });

  return out;
}

function replaceImport(_, $1, $2) {
  if (!$1) {
    return require_prefix + '(' + $2 + ');';
  }

  if ($1.indexOf(',') === -1 && $1.indexOf(' as ') === -1) {
    if ($1.indexOf('{') === -1 && $1.indexOf('}') === -1) {
      return 'var ' + $1.replace('*', id($2)) + ' = ' + require_prefix + '(' + $2 + ');';
    }

    return 'var ' + id($1) + ' = ' + require_prefix + '(' + $2 + ').' + id($1) + ';';
  }

  if ($1.indexOf('* as ') === -1) {
    var ref = id($2, true);

    return 'var ' + ref + ' = ' + require_prefix + '(' + $2 + '), ' + refs($1, ref).join(', ') + ';';
  }

  return 'var ' + $1.replace('* as ', '') + ' = ' + require_prefix + '(' + $2 + ');';
}

function replaceExport(_, $1, $2) {
  var prefix = 'module.exports';

  if ($1 === 'default') {
    prefix += ' = ' + $2;
  }

  if ($1 && !$2 || $1 === 'function') {
    prefix += '.' + ($2 || $1) + ' ';

    if ($1 === 'function') {
      prefix += '= ' + $1 + ' ' + $2;
    }
  }

  if (!$1) {
    prefix += ($2 ? '.' + $2 : '') + ' = ' + ($2 || '');
  }

  return prefix;
}

function rewrite(code) {
  code = code.replace(re_import, replaceImport);
  code = code.replace(re_export, replaceExport);

  return code;
}

module.exports = function(options, params, done) {
  fsbx = fsbx || require('fuse-box');

  var exts = support.getKnownExtensions();

  var regexp = new RegExp('\.(?:' + exts.map(function(ext) {
    return ext.replace(/^\./, '');
  }).join('|').replace(/\./g, '\\.') + ')$');

  fsbx.FuseBox.init({
    homeDir: path.dirname(params.filename),
    plugins: [{
      test: regexp,
      transform: function(file) {
        file.loadContents();

        return _render(file.info.absPath, file.contents.toString(), params)
          .then(function(result) {
            file.contents = rewrite(result.source);
            return file.contents;
          });
      }
    }]
  }).bundle('>' + path.basename(params.filename))
  .then(function(result) {
    params.source = result.contentParts.join('');

    done(undefined, params);
  })
  .catch(done);
};
