const { expect } = require('chai');

/* global describe, it */

describe('CLI', () => {
  describe('asking for --help', () => {
    beforeEach(done => {
      cmd('--help', done);
    });

    it('should display usage info', () => {
      expect(cmd.stdout).to.contain('tarima [watch]');
    });
  });

  describe('asking for --version', () => {
    beforeEach(done => {
      cmd('--version', done);
    });

    it('should display the package version', () => {
      expect(cmd.stdout).to.contain(require('../package.json').version);
    });
  });

  describe('quick check', () => {
    afterEach(() => {
      rmdir('build');
    });

    it('should copy unsupported files (default)', done => {
      cmd('a -fy sample.txt', () => {
        expect(!cmd.exitStatus).toBe(true);
        expect(cmd.stderr).to.eql('');
        expect(cmd.stdout).to.match(/copy.+?sample\.txt/);
        expect(cmd.stdout).to.contain('1 file written');
        expect(read('build/a/sample.txt')).to.contain('OK');
        done();
      });
    });

    it('should fail on broken sources when bundling', done => {
      cmd('a -fby bad.js', () => {
        expect(cmd.exitStatus).to.eql(1);
        expect(cmd.stderr).to.contain('export default `42');
        expect(cmd.stderr).to.contain('Unterminated template');
        expect(cmd.stdout).not.to.contain('Without changes');
        done();
      });
    });

    it('should bundle without mixed modules', done => {
      cmd('a -fby good.js', () => {
        expect(!cmd.exitStatus).toBe(true);
        expect(cmd.stderr).to.eql('');
        expect(cmd.stdout).to.contain('build/a/good.js');
        expect(cmd.stdout).to.contain('1 file written');
        expect(read('build/a/good.js')).to.contain('[x, template]');
        done();
      });
    });
  });
});
