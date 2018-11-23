'use strict';

const merge = require('../../helpers/merge');

let adoc;

function compile(params) {
  const opts = merge({
    showtitle: true,
  }, params.options.asciidoc || {});

  adoc = adoc || this.asciidoctorJs();
  params.source = adoc.convert(params.source, {
    header_footer: true,
    mkdirs: true,
    attributes: opts,
  });
}

module.exports = {
  compile,
  render: compile,
  ext: 'html',
  requires: ['asciidoctor.js'],
  support: ['asciidoc', 'adoc', 'asc'],
};
