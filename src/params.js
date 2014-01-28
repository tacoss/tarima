
var params_tpl = function(path) {
  var ext, name, parts, fullpath, filename;


  fullpath = path.split('/');
  filename = fullpath.pop();

  filename = filename.replace(/(\.[^.]+)\1{2,}/, '$1$1');
  filename = filename.replace('coffee.md', 'litcoffee');

  parts = filename.split('.');
  name = parts.shift();
  ext = parts.shift();


  return {
    filepath: fullpath.join('/'),
    filename: filename,
    parts: parts,
    name: name,
    ext: ext
  };
};
