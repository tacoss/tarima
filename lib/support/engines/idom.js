function render(params) {
  if (!params.next) {
    var idom = this.idomTemplate;

    params.source = [
      'function(data,el){var lib;return (lib=IncrementalDOM,lib.patch(',
      'el||document.body,', idom.compile(params.source, idom).toString(),
      ',data));}'
    ].join('');
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['idom'],
  requires: ['idom-template'],
  render: render,
  compile: render
};
