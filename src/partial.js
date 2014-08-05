
function Partial(params) {
  this.params = params;
}

Partial.prototype.override = function(path, source) {
  var params = _.extend({}, _.cloneDeep(this.params), params_tpl(path));

  if (source) {
    params.source = source;
  }

  return new Partial(params);
};

Partial.prototype.compile = function(locals) {
  var view = reduce_tpl(_.cloneDeep(this.params), locals, true);

  return view.source;
};

Partial.prototype.render = function(locals) {
  var view = reduce_tpl(_.cloneDeep(this.params), locals);

  if ('function' === typeof view.render) {
    return view.render(locals);
  }

  return view.source;
};
