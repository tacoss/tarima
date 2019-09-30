const { expect } = require('chai');

/* global describe, it */

const path = require('path');

describe('bundling support', () => {
  it('should bundle scripts', done => {
    const view = tarima('a.js');

    view.bundle((err, result) => {
      expect(err).to.eql(undefined);
      expect(result.source).to.contain('<h1>It works!</h1>"');
      expect(result.source).to.contain('function template');
      expect(result.source).to.contain('[x, template]');
      expect(result.source).to.contain('runtime');
      done();
    });
  });

  it('should skip non-scripts', done => {
    const view = tarima('x.pug', 'h1 #{x}');

    view.bundle({
      x: 'It works!'
    }, (err, result) => {
      expect(err).to.eql(undefined);
      expect(result.source).to.contain('<h1>It works!</h1>');
      done();
    });
  });
});

describe('Rollup.js integration', () => {
  it('should bundle modules', done => {
    tarima('module_a.litcoffee').bundle((err, result) => {
      expect(err).to.eql(undefined);
      expect(result.deps).to.contain(path.resolve(__dirname, 'fixtures/bar.yml'));
      expect(result.deps).to.contain(path.resolve(__dirname, 'fixtures/module_b.js'));
      expect(result.source).to.match(/var b.* = 'x'/);
      done();
    });
  });

  it('should bundle commonjs sources through plugins', done => {
    tarima('entry.js', {
      rollup: {
        onwarn(warning) {
          if (warning.code === 'MISSING_EXPORT') {
            return;
          }
          if (warning.code === 'MIXED_EXPORTS') {
            return;
          }
          console.log(warning.message);
        },
        plugins: {
          'rollup-plugin-node-resolve': {
            mainFields: ['js:next', 'main', 'module', 'browser'],
            preferBuiltins: false
          },
          'rollup-plugin-commonjs': {
            include: ['node_modules/**', '**/*.js']
          }
        }
      }
    }).bundle((err, result) => {
      expect(err).to.eql(undefined);
      expect(result.source).to.contain('exports.default = entry');
      done();
    });
  });

  it('should bundle remote dependencies', done => {
    tarima('remote.js').bundle((err, result) => {
      expect(err).to.eql(undefined);
      expect(result.source).to.contain('function noop');
      expect(result.source).to.contain('console.log(createElement)');
      done();
    });
  });
});
