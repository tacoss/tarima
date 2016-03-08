# Tarima

[![Build Status](https://travis-ci.org/gextech/tarima.png?branch=next)](https://travis-ci.org/gextech/tarima)
[![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima)
[![Coverage Status](https://codecov.io/github/gextech/tarima/coverage.svg?branch=next)](https://codecov.io/github/gextech/tarima?branch=next)

![Tarima](https://dl.dropboxusercontent.com/u/2726997/img/tarima_small.png)

```bash
$ npm install tarima
```

**Tarima** is a pre-processing tool based on filename extensions.

tl; dr &mdash; Of course [there are alternatives](#alternatives) or even would be easier to setup Gulp, Goble, Brunch, whatever... but repeating the same stuff every-time becomes frustrating.

Also we experienced serious issues from migrating from Grunt to Gulp, and then from Browserify to Webpack.

## How it works

Lets say `view.js.ract.jade` will produce a pre-compiled template for Ractive, which is rendered from Jade, etc.

If you omit the `js` extension then `view.ract.jade` will produce markup, since `html` is the default extension for the Ractive engine.

> You can add as many extensions you want, whilst the output is valid input for the next renderer in the chain.

### Front Matter

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

Since `0.10.0` all produced scripts using `bundle()` can specify its [standalone](https://github.com/substack/node-browserify#browserifyfiles--opts) namespace using the `_bundle` value, e.g.

```js
/*
---
_bundle: a.b.c
---
*/
export default 42
```

## Basic usage

```js
var tarima = require('tarima');

tarima.parse('view.ract.jade', 'x {{"y"}}')
  .render(function(err, result) {
    console.log(err, result);
  });
```

Example output:

```json
{
  "filename": "view.ract.jade",
  "options": {},
  "source": "<x>y</x>",
  "data": {},
  "parts": ["ract", "jade"],
  "name": "view",
  "locals": {},
  "runtimes": [],
  "dependencies": [],
  "extension": "html"
}
```

## Supported engines

You can install the following dependencies for specific support:

- `npm install coffee-script` &rarr; `.coffee` and `.litcoffee`
- `npm install jade` &rarr; `.jade`
- `npm install less` &rarr; `.less`
- `npm install imba` &rarr; `.imba`
- `npm install jisp` &rarr; `.jisp`
- `npm install ejs` &rarr; `.ejs`
- `npm install styl` &rarr; `.styl`
- `npm install handlebars` &rarr; `.hbs`
- `npm install ractive` &rarr; `.ract`
- `npm install kramed` &rarr; `.md` and `.coffee.md`
- `npm install idom-template` &rarr; `.idom`
- `npm install babel-core@^5` &rarr; `.jsx` and `.es6.js`

Babel 5x is more fast than 6x, but using babel 6x is already supported.

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

## Globals & Filters

## Dependant tools

- [tarima-cli](https://github.com/gextech/tarima-cli) support for CLI
- [gulp-tarima](https://github.com/gextech/gulp-tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt

## Alternatives

- [transformers](https://github.com/ForbesLindesay/transformers)
- [consolidate.js](https://github.com/tj/consolidate.js)
- [accord](https://github.com/jenius/accord)
