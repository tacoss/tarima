module.exports = {
  input: ['ract'],
  render: function(params, cb) {
    var Ractive = require('ractive');
    Ractive.DEBUG = false;
    cb(null, { out: new Ractive({ template: params.code, data: params.locals }).toHTML() });
  }
};
