'use strict';

const fs = require('fs');
const path = require('path');
const toSource = require('tosource');

const support = require('../../support');

const _export = /(module\.)?exports\s*=|export\s+default/;

const _commentsPattern = /\/\*.*?\*\//g;
const _allSelectorsPattern = /(?:^|\})?\s*([^{}]+)\s*\{/g;
const _singleSelector = /((?:(?:\[[^\]+]\])|(?:[^\s+>~:]))+)((?:::?[^\s+>~(:]+(?:\([^)]+\))?)*\s*[\s+>~]?)\s*/g;
const _excludedPatterns = /^\s*(?:@media|@keyframes|to|from|@font-face|\d+%)/;

function fn(code) {
  return `function(_c, context){${code}}`;
}

function wrap(view, short) {
  if (view.errors && view.errors.length) {
    throw new Error(view.errors.join('; '));
  }

  const _render = `${short ? '[' : '{render:'}${fn(view.render)},`;
  const _fns = `${short ? '' : 'staticRenderFns:'}${view.staticRenderFns.map(fn).join(',\n') || '[]'}`;

  // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
  return `${_render}${_fns}${short ? ']' : '}'}`
    .replace(/with\(this\)/g, 'if(window.__VUE_WITH_STATEMENT__)');
}

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

  const _content = [];

  function push(output) {
    _content.push(output.source);

    output.deps.forEach(dep => {
      if (params.deps.indexOf(dep) === -1) {
        params.deps.push(dep);
      }
    });
  }

  if (!support.isSupported(view[key].lang.split('.'))) {
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
          push(output);
        }

        next(err);
      });
    });
  }

  pipeline.push(next => {
    this.render({
      filename: `${params.name}.${view[key].lang}`,
      options: params.options,
      source: view[key].content,
      parts: view[key].lang.split('.'),
      name: params.name,
      data: {},
      deps: [],
    }, (err, output) => {
      if (!err) {
        push(output);
        target[key] = _content.join('\n');
      }

      next(err);
    });
  });
}

function compile(params, cb) {
  const vtc = this.vueTemplateCompiler;

  if (params.next && params.next !== 'js') {
    cb();
    return;
  }

  if (params.source.indexOf('<template') === -1 && params.source.indexOf('</template>') === -1) {
    params.source = `Vue.extend(${wrap(vtc.compile(params.source))})`;
    cb();
    return;
  }

  const view = vtc.parseComponent(params.source);

  if (view.script && !view.script.lang) {
    view.script.lang = 'es6';
  }

  if (view.style && !view.style.lang) {
    view.style.lang = 'css';
  }

  if (view.template && !view.template.lang) {
    view.template.lang = 'html';
  }

  const _target = {
    styles: [],
  };

  const _tasks = [];

  render.call(this, 'template', view, _target, params, _tasks);
  render.call(this, 'script', view, _target, params, _tasks);

  if (view.styles && view.styles.length) {
    view.styles.forEach((style, key) => {
      render.call(this, key, view.styles, _target.styles, params, _tasks);
    });
  }

  Promise.all(_tasks.map(chain =>
    new Promise((resolve, reject) =>
      chain(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }))))
  .catch(cb)
  .then(() => {
    const _id = params.name === 'index'
      ? path.basename(path.dirname(params.filename))
      : params.name;

    const _tpl = `__${_id}$t`;
    const _view = `__${_id}$v`;

    params.source = [
      'var ', _tpl, ' = ', _target.template ? wrap(vtc.compile(_target.template), true) : 'null', ';\n',
      'var ', _view, ' = {};\n',
      (_target.script || '')
        .replace(_export, `${_view} = `),
      _view, '._scopeId = "vue-', _id, '";\n',
      _view, '.render = ', _tpl, '[0];\n',
      _view, '.staticRenderFns = ', _tpl, '[1];\n',
    ].join('');

    if (_target.styles.length) {
      params.source += `
        if (typeof window !== "undefined" && window.__VUE_PUSH_STYLESHEET)
           window.__VUE_PUSH_STYLESHEET(${toSource(scope(`vue-${_id}`, _target.styles))});
      `;
    }

    if (_target.script && _export.test(_target.script)) {
      params.source += `\n${(_target.script || '').match(_export)[0]}`;
    } else {
      params.source += `\n${(params._import ? 'export default' : 'module.exports =')}`;
    }

    params.source += ` Vue.extend(${_view});\n`;

    cb();
  });
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['vue'],
  requires: ['vue-template-compiler'],
  included: "var Vue=Vue||(typeof window!=='undefined'?window:global).Vue||require('v'+'ue');",
};
