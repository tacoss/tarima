# Tarima

[![Build Status](https://travis-ci.org/gextech/tarima.png?branch=master)](https://travis-ci.org/gextech/tarima) [![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima) [![Coverage Status](https://coveralls.io/repos/gextech/tarima/badge.png?branch=master)](https://coveralls.io/r/gextech/tarima?branch=master)

![Tarima](https://dl.dropboxusercontent.com/u/2726997/img/tarima_small.png)

```bash
$ npm install tarima
```

**Tarima** is a pipeline library for templating  based on the filename extensions.

Define a template named `tpl.js.jade` and explicitly call `render()` or `compile()`:

```javascript
var tarima = require('tarima');

var template = 'h1 It works!';

var view = tarima.parse('tpl.js.jade', template);

console.log(view.render()); // <h1>It works!</h1>
console.log(view.compile()); // function template(locals) ...
```

Now rename your template into `tpl.html.jade` and the output will be the same.

## How the pipeline works

If a filename called `tpl.x.y` have two extensions, each extension will invoke a particular engine from right to left respectively.

When a extension has no registered engine, the pipeline will stop and return the current chain params.

- `params.next` will be passed with the name of the next file-extension
- `params.client ` will be `true` if was invoked with `compile()`
- `params.source` is used if the engine returns nothing

Since `0.9.0` tarima has no built-in support for any engine, instead you must install the required engines you'll use.

In example, lets say you want to use CoffeeScript and Jade only:

```bash
$ npm install tarima-coffee tarima-jade --save-dev
```

Available engines:

- `tarima-coffee` &rarr; `.{coffee,litcoffee}`
- `tarima-ejs` &rarr; `.ejs`
- `tarima-es6` &rarr; `.{jsx,es6.js}`
- `tarima-hbs` &rarr; `.hbs`
- `tarima-idom` &rarr; `.idom`
- `tarima-imba` &rarr; `.imba`
- `tarima-jade` &rarr; `.jade`
- `tarima-jisp` &rarr; `.jisp`
- `tarima-less` &rarr; `.less`
- `tarima-md` &rarr; `.md`
- `tarima-ract` &rarr; `.ract`
- `tarima-styl` &rarr; `.styl`

> See: https://github.com/tarima-core

### Engine API

All required engines must implement the following:

```javascript
module.exports = function(support, configure) {
  support('foo', function(params) {
    if (params.next === 'baz') {
      return 'bazzinga';
    }
  });
};
```

The `params` object looks like:

```javascript
{
  next: undefined,
  client: false,
  filepath: '',
  filename: 'foo.js.coffee',
  parts: [ 'js', 'coffee' ],
  name: 'foo',
  ext: 'js',
  options: { locals: {} },
  source: '-> "string"',
  keypath: 'foo'
}
```

Using `params.source` the callback must build the string to render or compile it.

If `params.client` is `true` it must return a compiled function to render on the client:

```javascript
var tpl = new TemplateEngine(params.source, params.options);

if (params.client) {
  return tpl.compile({ client: true });
}

return tpl.render();
```

Note that in the browser a runtime is required for some engines.

> Some engines can `compile()` for the browser but most will `render()` only.

### Available methods

#### `parse(filepath, source, options)`

Generate a partial view from the given source and filepath.

```javascript
var view = tarima.parse('foo.js.jade', 'h1 It works');
```

#### `load(filepath, options)`

Same as parse but reading from filesystem instead.

```javascript
var view = tarima.load('/path/to/foo.js.jade');
```

#### `bundle(array, options)`

Will bundle the array of templates into a stringified JST variable.

```javascript
var code = tarima.bundle([tarima.parse('bar.js.ejs', '<%= value %>')]);
```

### Options

- `cwd` &mdash; Set relative keys on `bundle()`
- `locals` &mdash; Local variables on `bundle()`
- `filter` &mdash; Execute this callback after `parse()`
- `wrapper` &mdash; Execute this callback after `bundle()`
- `marker` &mdash; Custom marker for extracting front-matter
- `exports` &mdash; If true prepends `module.exports` on fn-views
- `globals` &mdash; Object map for injecting static globals within scripts

If you want to override certain options for any engine:

```javascript
var view = tarima.load('/path/to/view.js.coffee', {
  // custom settings for coffee-engine
  coffee: { bare: true }
});
```

### Calling the pipeline

Once you've parsed or loaded a template you can get its output or data, or both.

#### compile(locals)

Return the pre-compiled version if possible, otherwise return the same source.

```javascript
var js = tarima.parse('tpl.js.jade', 'h1 ok').compile();

console.log(js); // function template(locals) ...
```

#### render(locals)

Render and return as string, most template-engines do this.

```javascript
var html = tarima.parse('tpl.html.jade', 'h1 ok').render();

console.log(html); // <h1>ok</h1> ...
```

#### data(locals, raw)

Will `render()` and return the resulting view-params as is.

- If `raw` is **true** `compile()` will be called instead
- If `locals` is boolean it will be used as `raw` and `locals` will be empty

```javascript
var tpl = tarima.parse('tpl.js.jade', 'h1 ok');

console.log(tpl.data().source); // <h1>ok</h1> ...
console.log(tpl.data(true).source); // function template(locals) ...
```

## Front-matter

All parsed files can use a front-matter block for local data.

```jade
//-
  ---
  title: Untitled
  _render: other/layout.hbs
  extended: !include ../path/to.yml
  ---

h1= title
```

Since `0.8.0` tarima introduced the `_render` keyword which is used to `yield` the rendered view through more templates, e.g.

```html
{{!-- other/layout.hbs --}}
<div>{{{ yield }}}</div>
```

Output:

```html
<div><h1>Untitled</h1></div>
```

Since `0.8.1` you can merge additional files using `!include` within any front-matter block.

## Helpers

Since `0.7.8` tarima exposes some internal utilities:

- `tarima.util`
  - `isView(filename)`
  - `isScript(filename)`
  - `isTemplate(sourcecode)`

## Dependant tools

- [tarima-cli](https://github.com/gextech/tarima-cli) support for CLI
- [gulp-tarima](https://github.com/gextech/gulp-tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt

## Issues?

You're welcome to open a ticket or submit a PR. ;-)
