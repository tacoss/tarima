'use strict';

var _ = require('lodash'),
    $ = require('./util');

var Partial = module.exports = function(params, parsers) {
  this.params = params;
  this.parsers = parsers;
};

Partial.prototype.compile = function(locals) {
  var view = $.reduce(this.parsers, _.cloneDeep(this.params), locals, true);

  return view.source;
};

Partial.prototype.render = function(locals) {
  var view = $.reduce(this.parsers, _.cloneDeep(this.params), locals);

  if (typeof view.render === 'function') {
    return view.render(locals);
  }

  return view.source;
};
