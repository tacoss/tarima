module.exports = {
  input: ['jade'],
  require: ['jade'],
  render: function(params, cb) {
    var jade = require('jade');
    var tpl = jade.compile(params.code);
    cb(null, { out: tpl(params.locals), deps: tpl.dependencies });
  }
};
