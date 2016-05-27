# Tarima

[![Build Status](https://travis-ci.org/gextech/tarima.png?branch=next)](https://travis-ci.org/gextech/tarima)
[![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima)
[![Coverage Status](https://codecov.io/github/gextech/tarima/coverage.svg?branch=next)](https://codecov.io/github/gextech/tarima)

![Tarima](https://dl.dropboxusercontent.com/u/2726997/img/tarima_small.png)

```bash
$ npm install tarima
```

**Tarima** is a pre-processing tool based on filename extensions.

Of course [there are alternatives](#alternatives) or even would be easier to setup Gulp, Brunch, whatever... but repeating the same stuff every-time becomes frustrating.

Also we experienced serious issues from migrating from Grunt to Gulp, and then from Browserify to Webpack.

## How it works

Lets say `view.js.ract.jade` will produce a pre-compiled template for Ractive, which is rendered from pug, etc.

If you omit the `js` extension then `view.ract.jade` will produce markup, since `html` is the default extension for the Ractive engine.

> You can add as many extensions you want, whilst the output is valid input for the next renderer in the chain.

### Parsing

`load(filename, options)` &mdash; Shortcut for calling `parse()` from reading the given filename with `fs.readFileSync()`.

See below. &darr;

`parse(filename, source, options)`  &mdash; Primary method for turning the given source into a abstract representation of itself.

> The filename is required but _not required_ to exists, is just a hint for tarima to understand what to do with it.

The resulting object will contain a `render()` callback and `params` object, respectively:

- `partial.render(locals, callback)`  &mdash; Performs the transpilation on the given source, producing a new source.

- `partial.params` &mdash; An object like:

```javascript
{
  "filename": "view.ract.pug",
  "options": {}, // passed options to the factory
  "source": "<x>y</x>",
  "parts": ["ract", "pug"],
  "name": "view",
  "data": {}, // any data passed as front-matter
  "deps": [], // all imported-or-required sources
  "locals": {}, // values passed from the callback
  "runtimes": [], // js-expressions for required modules
  "extension": "html"
}
```

Example:

```javascript
var tarima = require('tarima');

var view = tarima.parse('view.ract.pug', 'x {{"y"}}');

// direct
view.render(function(err, result) {
  console.log(err, result);
});
```

### Bundling

`bundle(partial)`  &mdash; Performs the transpilation on the given source, and turn it into a new module.

- Given multiple sources the resulting module will export an object with all transpiled sources, and all of them should be valid templates in order to work.

- Some sources like stylesheets already performs some kind on bundling, but other sources like Javascript doesn't.

Example:

```javascript
// bundled
tarima.bundle(view).render(function(err, result) {
  console.log(err, result);
});
```

### Front Matter

All parsed files can use a front-matter block for local data.

```jade
//-
  ---
  title: Untitled
  _render: other/layout.hbs
  extended: !include ../path/to.yml
  ---

h1= title + extended.some.value
```

Note you can merge additional files using the `!include` directive within any front-matter block.

#### Special keys

Tarima use some predefined keys in order to customize certain aspects of rendering, transpilation or bundling individually:

`_render` &mdash; Renders the actual source using other supported source as template, useful for reusing views.

The given template should be able to output the `yield` variable:

```html
{{!-- other/layout.hbs --}}
<div>{{{ yield }}}</div>
```

Output:

```html
<div><h1>Untitled</h1></div>
```

> The `_render` option is available only for templates.

`_bundle` &mdash; This value will be used as the `moduleName` option for rollup, as stated on [its guide](https://github.com/rollup/rollup/wiki/JavaScript-API#modulename) it's required for modules (or entry-points this way).

`_format` &mdash; This value is passed directly as `format` option for rollup, [available formats](https://github.com/rollup/rollup/wiki/JavaScript-API#format) are: `amd`, `js`, `es6`, `iife`, `umd`.

> Both options `_bundle`  and `_format` are available only when `bundle()` is called, see above.

## Supported engines

You can install the following dependencies for specific support:

- `npm install coffee-script` &rarr; `.coffee` and `.litcoffee` (aka `.coffee.md`)
- `npm install pug` &rarr; `.pug` and `.jade` (legacy)
- `npm install less` &rarr; `.less`
- `npm install imba` &rarr; `.imba`
- `npm install jisp` &rarr; `.jisp`
- `npm install ejs` &rarr; `.ejs`
- `npm install styl` &rarr; `.styl`
- `npm install handlebars` &rarr; `.hbs`
- `npm install ractive` &rarr; `.ract` and `.rv`
- `npm install kramed` &rarr; `.md`, `.mkd`
- `npm install idom-template` &rarr; `.idom`
- `npm install babel-core@^5` &rarr; `.jsx` and `.es6.js`

> Tarima doesn't ship any dependency for the supported engines, is your responsability to install whatever you will need.

### ES6 support

Tarima supports `.es6` through [Bublé](http://buble.surge.sh/) which is so damn fast and lot constrained than Babel, or, if you want to use Babel:

Run `npm install babel-core@^6 babel-preset-es2015` to get the latest babel version with es2015 as default preset:

```js
var tarima = require('tarima');

tarima.parse('x.es6.js', 'export default 42', {
  babel: {
    presets: [require.resolve('babel-preset-es2015')]
  }
}).render(function(err, result) {
  console.log(err, result);
});
```

### Globals

As part of the transpilation process you can put any value as global using the `globals` option:

```javascript
tarima.parse('x.js', '/* global foo */console.log(foo);', {
  globals: {
    foo: 'bar'
  }
}).render(function(err, result) {
  console.log(result.source);
});
```

The previous code will output this:

```javascript
var foo = "bar";
console.log(foo);
```

All given globals are injected in the sample place as the `/* global */` comment is declared.

Also you can pass any value, even functions, because all values are normalized through the [tosource](https://github.com/marcello3d/node-tosource) module.

> Note globals are injected during the `post-filter`phase, see below.

### Filters

Tarima handle sources this way: `read -> pre-filter -> compile -> post-filter`.

Passing a function as the `filter` option brings you the ability to modify the partial view during the `pre-filter` phase.

### Locals

All supported templates can take locals, you can pass any values when calling `.render(locals, cb)` to draw them during the compile (or render) process.

## Utilities

`support.getKnownExtensions()` &mdash; Mixed extensions from all supported engines, e.g. `['.js', '.js.pug', '.js.rv.pug']` as used for resolving know sources.

`support.getExtensions()` &mdash; Raw extensions from all supported engines, e.g. `['js', 'md', 'ract']`.

`support.isSupported(filename)` &mdash; True if the given filename is really supported for any registered engine.

`support.isTemplate(extname)` &mdash; True if the given extname is used primary for templates or views.

`support.isScript(extname)` &mdash; True if the given extname is used primary for scripts.

`support.resolve(extname)` &mdash; WIll resolve the most immediate engine that support the given extension.

## Dependant tools

- [tarima-cli](https://github.com/gextech/tarima-cli) support for CLI
- [gulp-tarima](https://github.com/gextech/gulp-tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt

## Alternatives

- [transformers](https://github.com/ForbesLindesay/transformers)
- [consolidate.js](https://github.com/tj/consolidate.js)
- [accord](https://github.com/jenius/accord)
