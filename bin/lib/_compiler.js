'use strict';

// https://raw.githubusercontent.com/parcel-bundler/parcel/master/src/WorkerFarm.js

const Farm = require('worker-farm/lib/farm');

let _shared = null;

class WorkerFarm extends Farm {
  constructor(options) {
    super({
      autostart: true,
    }, require.resolve('./_worker'));

    this._local = require('./_worker');
    this._remote = this.setup(['init', 'run']);
    this._started = false;

    this.init(options);
  }

  init(options) {
    this._started = false;
    this._local.init(options);

    const tasks = [];

    for (let i = 0; i < this.activeChildren; i += 1) {
      tasks.push(this._remote.init(options));
    }

    return Promise.all(tasks).then(() => {
      this._started = true;
    });
  }

  run() {
    const args = Array.prototype.slice.call(arguments);
    const cb = !this._started
      ? this._local.run
      : this._remote.run;

    return cb.apply(null, args);
  }

  end() {
    super.end();
    _shared = null;
  }
}

module.exports = WorkerFarm;
module.exports.getShared = options => {
  if (!_shared) {
    _shared = new WorkerFarm(options);
  } else {
    _shared.init(options);
  }

  return _shared;
};
