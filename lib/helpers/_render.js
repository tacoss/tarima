'use strict';

const fs = require('fs');
const path = require('path');

const support = require('../support');

const _commentsPattern = /\/\*.*?\*\//g;
const _allSelectorsPattern = /(?:^|\})?\s*([^{}]+)\s*\{/g;
const _singleSelector = /((?:(?:\[[^\]+]\])|(?:[^\s+>~:]))+)((?:::?[^\s+>~(:]+(?:\([^)]+\))?)*\s*[\s+>~]?)\s*/g;
const _excludedPatterns = /^\s*(?:@media|@keyframes|to|from|@font-face|\d+%)/;

function scope(id, styles) {
  const _attr = `[${id}]`;

  return styles.map(css => {
    return css.replace(_commentsPattern, '')
      .replace(_allSelectorsPattern, (_, $1) => {
        if (_excludedPatterns.test($1)) {
          return _;
        }

        const selectors = $1.split(',').map(s => s.trim());

        const scoped = selectors
          .map(s => {
            const matches = [];

            let match;

            do {
              match = _singleSelector.exec(s);

              if (match) {
                matches.push([match[0], `${match[1]}${_attr}${match[2]}`]);
              }
            } while (match);

            matches.forEach(m => {
              s = s.replace(m[0], m[1]);
            });

            return s;
          });

        return _.replace($1, `${scoped.join(', ')} `);
      });
  });
}

function render(key, view, target, params, pipeline) {
  if (!view[key]) {
    target[key] = '';
    return;
  }

  target[key] = '';

  function push(output) {
    target[key] += output.source;

    output.deps.forEach(dep => {
      if (params.deps.indexOf(dep) === -1) {
        params.deps.push(dep);
      }
    });
  }

  if ((key === 'template' && view[key].lang !== 'html')
    && !support.isSupported(view[key].lang.split('.'))) {
    console.warn(`[render] Unsupported '${view[key].lang}' extension`);
    target[key] = view[key].content;
    return;
  }

  if (view[key].src) {
    if (key === 'template' && view[key].content) {
      throw new Error('Tag <template> cannot have both src and content');
    }

    pipeline.push(next => {
      const _file = path.resolve(path.dirname(params.filename), view[key].src);
      const _params = this.parse(_file, fs.readFileSync(_file).toString(), params.options);

      this.render(_params, (err, output) => {
        if (!err) {
          params.deps.push(_file);
          push(output);
        }

        next(err);
      });
    });
  }

  pipeline.push(next => {
    this.render({
      filename: `${params.filename}/${key}.${view[key].lang}`,
      options: params.options,
      source: view[key].content,
      parts: view[key].lang.split('.'),
      name: params.name,
      data: {},
      deps: [],
    }, (err, output) => {
      if (!err) {
        push(output);
      }

      next(err);
    });
  });
}

function compile(view, target, params) {
  if (view.script && !view.script.lang) {
    view.script.lang = 'es6';
  }

  if (view.style && !view.style.lang) {
    view.style.lang = 'css';
  }

  if (view.template && !view.template.lang) {
    view.template.lang = view.template.src
      ? view.template.src.split('.').pop()
      : 'html';
  }

  const _tasks = [];

  render.call(this, 'template', view, target, params, _tasks);
  render.call(this, 'script', view, target, params, _tasks);

  if (view.styles && view.styles.length) {
    view.styles.forEach((style, key) => {
      render.call(this, key, view.styles, target.styles, params, _tasks);
    });
  }

  return Promise.all(_tasks.map(chain =>
    new Promise((resolve, reject) =>
      chain(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }))));
}

module.exports = {
  compile,
  render,
  scope,
};
