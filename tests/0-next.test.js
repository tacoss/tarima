const { expect } = require('chai');

/* global describe, it */

const render = require('../lib/helpers/render');

describe('Renderer', () => {
  it('will run on supported extensions', done => {
    const partial = {
      filename: 'test.js.pug',
      source: 'h1 It works!',
      parts: ['js', 'pug'],
      runtimes: [],
      options: {},
      deps: []
    };

    render(partial, (err, result) => {
      expect(result.source).to.contain('function template');
      expect(result.source).to.contain('It works!');
      expect(result.runtimes[0]).to.contain('ug-runtime');
      done();
    });
  });

  it('will skip all unsupported extensions', done => {
    const partial = {
      filename: 'test.foo.bar',
      source: 'test code',
      parts: ['foo', 'bar'],
      runtimes: [],
      options: {},
      deps: []
    };

    render(partial, (err, result) => {
      expect(result).to.eql(partial);
      done();
    });
  });
});
