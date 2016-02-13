module.exports = {
  input: ['jade'],
  require: ['jade'],
  render: function(params, cb) {
    var jade = require('jade');
    var tpl = jade.compile(params.code, { filename: params.src });
    cb(null, { out: tpl(params.locals), deps: tpl.dependencies });
  },
  compile: function(params, cb) {
    var jade = require('jade');
    var tpl = jade.compileClientWithDependenciesTracked(params.code, { filename: params.src });
    cb(null, { out: tpl.body, deps: tpl.dependencies });
  }
};
