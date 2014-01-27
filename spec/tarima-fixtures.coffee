__ = 'WHAT YOU EXPECT?'

tarima = require('../lib/tarima')
template = {}

# DRY: write a function for this?

template.foo_source = 'a:b:c:|{{d||"e=<%=f%>"}}'
template.foo_partial = tarima.parse 'foo', __
template.foo_result = __

template.bar_source = "pre.\n  " + template.foo_source
template.bar_partial = tarima.parse 'foo.bar', template.bar_source
template.bar_result = template.bar_source

template.js_dummy = 'function anonymous(locals_){with(locals_||{}){}}'
template.js_source = 'return "|{{#i}}" + n + "{{/i}}"'
template.js_params = n: 's'

template.js_foo_source = template.js_source
template.js_foo_partial = tarima.parse 'foo.js', template.js_foo_source
template.js_foo_params = n: 'p'
template.js_foo_result = '|{{#i}}p{{/i}}'

template.js_js_source = template.js_source
template.js_js_partial = tarima.parse 'foo.js.js', template.js_js_source
template.js_js_params = n: 'a'
template.js_js_result = '|{{#i}}a{{/i}}'

template.js_js_js_source = template.js_source
template.js_js_js_partial = tarima.parse 'foo.js.js.js', template.js_js_js_source
template.js_js_js_params = n: 'm'
template.js_js_js_result = '|{{#i}}m{{/i}}'

template.js_bar_source = template.js_source
template.js_bar_partial = tarima.parse 'foo.js.bar', template.js_bar_source
template.js_bar_params = n: 'm'
template.js_bar_result = template.js_bar_source

template.js_tpl_foo_source = template.js_source
template.js_tpl_foo_partial = tarima.parse 'tpl.foo.js', template.js_tpl_foo_source
template.js_tpl_foo_params = n: 'i'
template.js_tpl_foo_result = '|{{#i}}i{{/i}}'

template.js_tpl_bar_source = template.js_source
template.js_tpl_bar_partial = tarima.parse 'tpl.foo.js.bar', template.js_tpl_bar_source
template.js_tpl_bar_params = n: 'n'
template.js_tpl_bar_result = template.js_tpl_bar_source

template.jade_dummy = 'function anonymous(locals){var buf = [];)}'
template.jade_source = '''
  h1 I'm a template
  p: span: <%= WUT %>
'''

#template.jade_result "<h1>I'm a template</h1><p><span><%= WUT %></span></p>"
#template.jade_partial_result = __

# template.jade_partial = tarima.parse 'tpl.jade', template.jade_source
# template.jade_js_partial = tarima.parse 'tpl.js.jade', template.jade_source
# template.jade_foo_partial = tarima.parse 'tpl.jade.foo', template.jade_source
# template.jade_bar_partial = tarima.parse 'tpl.bar.jade', template.jade_source

module.exports = (which) ->
  if source = template["#{which}_source"]
    source: source
    result: template["#{which}_result"] if template["#{which}_result"]
    dummy: template["#{which}_dummy"] if template["#{which}_dummy"]
    params: template["#{which}_params"] if template["#{which}_params"]
    partial: template["#{which}_partial"] if template["#{which}_partial"]
