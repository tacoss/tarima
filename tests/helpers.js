const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const tarima = require('../lib');

global.bundle = tarima.bundle;
global.cmd = require('./helpers/cmd');
global.read = require('./helpers/read');
global.write = require('./helpers/write');
global.exists = require('./helpers/exists');
global.unlink = require('./helpers/unlink');
global.rmdir = require('./helpers/rmdir');

global.fixture = filename => {
  return path.join(__dirname, 'fixtures', filename);
};

global.tarima = (filename, source, opts) => {
  if (typeof source !== 'string') {
    opts = source;
    source = '';
  }

  if (typeof opts === 'function') {
    opts = {};
  }

  const test_file = fixture(filename);

  if (global.exists(test_file)) {
    return tarima.load(test_file, opts);
  }

  return tarima.parse(filename, source, opts);
};

global.test = (args, cb, locals) => {
  return global.it(args[0], done => {
    return global.tarima(...args).render(locals, (err, result) => {
      let e;

      if (err) {
        console.log(args);
        console.log(err.stack || err.message);
        return done();
      }

      expect(err).to.eql(undefined);

      try {
        cb(result);
      } catch (error) {
        e = error;
        console.log(e);
      }

      done();
    });
  });
};
