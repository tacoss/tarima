'use strict';

const path = require('path');
const toSource = require('tosource');

const _render = require('../../helpers/_render');

const _export = /(module\.)?exports\s*=|export\s+default/;

function fn(code) {
  return `function(_c, context){${code}}`;
}

function wrap(view, short) {
  if (view.errors && view.errors.length) {
    throw new Error(view.errors.join('; '));
  }

  const _a = `${short ? '[' : '{render:'}${fn(view.render)}`;
  const _b = `,\n${short ? '' : 'staticRenderFns:'}[${view.staticRenderFns.map(fn).join(',\n')}`;
  const _c = `]${short ? ']' : '}'}`;

  // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
  return [_a, _b, _c].join('')
    .replace(/with\(this\)/g, 'if(window.__VUE_WITH_STATEMENT__)');
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

  let view;

  try {
    view = vtc.parseComponent(params.source);
  } catch (e) {
    console.warn(`[vue] ${e.toString()}`);
    cb(e);
    return;
  }

  const _target = {
    styles: [],
  };

  _render.compile.call(this, view, _target, params)
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
          .replace(_export, `${_view} = `), ';\n',
        _view, '._scopeId = "vue', _id, '";\n',
        _view, '.render = ', _tpl, '[0];\n',
        _view, '.render._withStripped = true;\n',
        _view, '.staticRenderFns = ', _tpl, '[1];\n',
      ].join('');

      if (_target.styles.length) {
        params.source += `
        if (typeof window !== "undefined" && window.__PUSH_STYLESHEET)
           window.__PUSH_STYLESHEET(${toSource(_render.scope(`vue-${_id}`, _target.styles))});
      `;
      }

      if (_target.script && _export.test(_target.script)) {
        params.source += `\n${(_target.script || '').match(_export)[0]}`;
      } else {
        params.source += `\n${(params._import ? 'export default' : 'module.exports =')}`;
      }

      params.source += ` ${_view}`;
      cb();
    })
    .catch(cb);
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['vue', 'vue.pug'],
  requires: ['vue-template-compiler'],
  included: "var Vue=Vue||(typeof window!=='undefined'?window:global).Vue||require('v'+'ue');",
};
