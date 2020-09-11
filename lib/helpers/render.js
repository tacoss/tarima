'use strict';

const debug = require('debug')('tarima:renderer');

const fs = require('fs');
const path = require('path');

const parse = require('./parse');
const merge = require('./merge');
const support = require('../support');

module.exports = function render(params, done) {
  const _cwd = params.options.cwd || process.cwd();

  function push(engine, previous) {
    return new Promise((resolve, reject) => {
      const fixedMethod = previous === 'js' ? 'compile' : 'render';

      function append() {
        if (previous === 'js' && engine.included) {
          params.runtimes.push(engine.included);
        }

        resolve();
      }

      params.next = previous;

      try {
        const _ctx = {};

        _ctx.parse = parse;
        _ctx.render = render;
        _ctx.support = support;

        (engine.requires || [])
          .forEach(moduleId => {
            const key = moduleId.replace('@', '')
              .replace(/\W([a-z])/g, (_, word) => word.toUpperCase());

            Object.defineProperty(_ctx, key, {
              get() {
                /* eslint-disable global-require */
                return require(moduleId);
              },
            });
          });

        let _called;

        params.locals = params.locals || {};
        params.locals.self = params.locals.self || {};
        params.locals.self.cwd = params.locals.self.cwd || _cwd;
        params.locals.self.parent = params.locals.self.parent || path.relative(_cwd, params.filename);
        params.locals.self.filename = params.locals.self.filename || path.relative(_cwd, params.filename);

        const test = engine[fixedMethod].call(_ctx, params, err => {
          _called = true;

          if (err) {
            reject(err);
          } else {
            append();
          }
        });

        if (test && typeof test.then === 'function') {
          test.then(append).catch(reject);
          return;
        }

        if (engine[fixedMethod].length > 1) {
          return;
        }

        if (!_called) {
          append();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  params.locals = merge({},
    params.options.globals,
    params.options.locals,
    params.locals,
    params.data);

  params.runtimes = [];

  const pipeline = params.parts.slice().reverse();
  const extensions = params.options.extensions || {};
  const knownExtensions = ['es', 'esm', 'cjs', 'umd', 'iife', 'test', 'spec', 'bundle'];

  debug('%s', path.relative(_cwd, params.filename));

  // automatic-modes based on extensions
  params.parts.forEach(ext => {
    if (ext === 'bundle') params.data.$bundle = true;
    if (ext === 'es' || ext === 'esm') params.data.$format = 'es';
    if (ext === 'umd' || ext === 'cjs' || ext === 'iife') params.data.$format = ext;
  });

  // clean out special locals
  delete params.locals.$modules;
  delete params.locals.$include;
  delete params.locals.$nofiles;
  delete params.locals.$render;
  delete params.locals.$unpkg;
  delete params.locals.$bundle;
  delete params.locals.$format;
  delete params.locals.$globals;
  delete params.locals.$external;
  delete params.locals.$transpiler;

  return pipeline
    .reduce((prev, cur, i) =>
      prev.then(() => {
        params.extension = cur;

        if (extensions[cur] !== false) {
          const engine = support.resolve(cur);

          if (engine) {
            params.extension = engine.ext;

            return push(engine, pipeline[i + 1]);
          }
        }
      }), Promise.resolve())
    .then(() => {
      if (knownExtensions.includes(params.extension) || extensions[params.extension] === false) {
        params.extension = params.parts.join('.');
      }

      if (params.isScript && support.isTemplateFunction(params.source)) {
        params.source = `${params._import ? 'export default' : 'module.exports ='} ${params.source}`;
      }

      if (!params.isScript && params.data.$render) {
        const _layout = path.resolve(path.dirname(params.filename), params.data.$render);
        const _params = parse(_layout, fs.readFileSync(_layout).toString(), params.options);

        _params.locals = merge({}, _params.locals || {}, params.locals);
        _params.locals.yield = params.source;
        _params.locals.self = _params.locals.self || {};
        _params.locals.self.cwd = _params.locals.self.cwd || _cwd;
        _params.locals.self.parent = _params.locals.self.parent || path.relative(_cwd, params.filename);
        _params.locals.self.filename = _params.locals.self.filename || path.relative(_cwd, _params.filename);

        delete params.data.$render;

        render(_params, (err, result) => {
          if (!err) {
            params.source = result.source;
            params.sourceMap = result.sourceMap;

            result.deps.forEach(dep => {
              if (params.deps.indexOf(dep) === -1) {
                params.deps.push(dep);
              }
            });

            params.deps.push(_layout);
          }

          done(err, params);
        });
      } else {
        done(undefined, params);
      }
    })
    .catch(error => done(error, params));
};
