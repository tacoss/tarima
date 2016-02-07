module.exports = function() {
  if (data[RENDER_KEY]) {
    var src = path.join(tpl.filepath, data[RENDER_KEY]);

    delete data[RENDER_KEY];

    var sub = tarima.load(src).data($.merge({}, data, { yield: tpl.source }));

    tpl.required = tpl.required || [];

    [src].concat(sub.required || []).forEach(function(dep) {
      if (tpl.required.indexOf(dep) === -1) {
        tpl.required.push(dep);
      }
    });

    if (sub.dependencies) {
      tpl.dependencies = ((tpl.dependencies || '') + '\n' + sub.dependencies).trim();
    }

    tpl.source = sub.source;
  }
};
