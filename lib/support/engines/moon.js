'use strict';

// taken from moon-ssr
const VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function renderNode(node) {
  let html = '';

  if (node.type === '#text') {
    html += node.val;
  } else if (node.meta.component) {
    html += renderNode((new node.meta.component.CTor()).render());
  } else {
    html += `<${node.type} `;

    Object.keys(node.props.attrs).forEach(prop => {
      html += `${prop}=${JSON.stringify(node.props.attrs[prop])} `;
    });

    html = html.slice(0, -1);
    html += '>';

    for (let i = 0, c = node.children.length; i < c; i += 1) {
      html += renderNode(node.children[i]);
    }

    if (VOID_ELEMENTS.indexOf(node.type) === -1) {
      html += `</${node.type}>`;
    } else {
      html = `${html.slice(0, -1)}/>`;
    }
  }

  return html;
}

function render(params) {
  const Moon = this.moonjs;

  const instance = new Moon({
    data: params.locals,
  });

  instance.$render = Moon.compile(params.source);

  params.source = renderNode(instance.render());
}

function compile(params) {
  if (!params.next || params.next === 'js') {
    params.source = this.moonjs.compile(params.source).toString();
  }
}

module.exports = {
  render,
  compile,
  ext: 'html',
  support: ['moon'],
  requires: ['moonjs'],
};
