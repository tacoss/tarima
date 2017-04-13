const path = require('path');
const deindent = require('deindent');
const toSource = require('tosource');

const _render = require('../../helpers/_render');

const exportsRe = /(module\.)?exports\s*=|export\s+default/;
const templateRe = /<template([^<>]*)>([\s\S]+?)<\/template>/i;
const stylesReSrc = /<style([^<>]*)?>\s*<\/style>/ig;
const stylesRe = /<style([^<>]*)?>([\s\S]+?)<\/style>/ig;
const scriptRe = /<script([^<>]*)?>([\s\S]+?)<\/script>/i;
const attrsRe = /(\w+)=("|')(.+?)\2/g;

function attrs(code) {
  const obj = {};

  code.replace(attrsRe, (_, key, quote, value) => {
    obj[key] = value;
  });

  return obj;
}

function extract(code) {
  const tplStart = code.indexOf('<template');
  const tplEnd = code.lastIndexOf('</template>');

  const templateInfo = code.substr(tplStart, tplEnd + 11).match(templateRe);
  const tplAttrs = attrs(templateInfo[1]);

  const template = {
    type: 'template',
    attrs: tplAttrs,
    lang: tplAttrs.lang || 'html',
    content: deindent(templateInfo[2] || ''),
  };

  const styles = [];

  code = code.replace(stylesReSrc, (_, _attrs) => {
    const styleAttrs = attrs(_attrs);

    styles.push({
      type: 'style',
      attrs: styleAttrs,
      lang: styleAttrs.lang || 'css',
    });

    return '';
  })
  .replace(stylesRe, (_, _attrs, _content) => {
    const styleAttrs = attrs(_attrs);

    styles.push({
      type: 'style',
      attrs: styleAttrs,
      lang: styleAttrs.lang || 'css',
      content: deindent(_content || ''),
    });

    return '';
  })
  .replace(templateInfo[0], '');

  const scriptTest = code.match(scriptRe) || [];
  const scriptAttrs = attrs(scriptTest[1] || '');

  const script = {
    type: 'script',
    attrs: scriptAttrs,
    lang: scriptAttrs.lang || 'js',
    content: deindent(scriptTest[2] || ''),
  };

  return {
    template,
    styles,
    script,
  };
}

function compile(params, cb) {
  if (!params.next || params.next === 'js') {
    // almost identical setup as vue single-file-components
    if (params.source.indexOf('<template') > -1 && params.source.indexOf('</template>') > -1) {
      const view = extract(params.source);

      const _target = {
        styles: [],
      };

      _render.compile.call(this, view, _target, params)
      .catch(cb)
      .then(() => {
        const _id = params.name === 'index'
          ? path.basename(path.dirname(params.filename))
          : params.name;

        const name = _id[0].toUpperCase()
          + _id.slice(1).replace(/\W(\w)/, ($0, char) => char.toUpperCase());

        params.source = [
          'var __m$ = {};\n',
          _target.script.replace(exportsRe, '__m$ ='),
          '\n__m$.render = ', this.moonjs.compile(_target.template).toString(),
        ].join('');

        if (_target.styles.length) {
          params.source += `
            if (typeof window !== "undefined" && window.__PUSH_STYLESHEET)
               window.__PUSH_STYLESHEET(${toSource(_render.scope(`moon-${_id}`, _target.styles))});
          `;
        }

        if (_target.script && exportsRe.test(_target.script)) {
          params.source += `\n${(_target.script || '').match(exportsRe)[0]}`;
        } else {
          params.source += `\n${(params._import ? 'export default' : 'module.exports =')}`;
        }

        params.source += ` Moon.component("${name}", __m$)`;

        cb();
      });
    } else {
      params.source = this.moonjs.compile(params.source).toString();
      cb();
    }
  } else {
    cb();
  }
}

module.exports = {
  compile,
  render: compile,
  ext: 'js',
  support: ['moon'],
  requires: ['moonjs'],
  included: "var Moon=Moon||(typeof window!=='undefined'?window:global).Moon||require('m'+'oonjs');",
};
