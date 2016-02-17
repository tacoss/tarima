# Tarima

[![Build Status](https://travis-ci.org/gextech/tarima.png?branch=next)](https://travis-ci.org/gextech/tarima)
[![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima)
[![Coverage Status](https://codecov.io/github/gextech/tarima/coverage.svg?branch=next)](https://codecov.io/github/gextech/tarima?branch=next)

![Tarima](https://dl.dropboxusercontent.com/u/2726997/img/tarima_small.png)

```bash
$ npm install tarima
```

**Tarima** is a pipeline library for templating  based on the filename extensions.

- [ ] TODO: describe next-api

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

## Dependant tools

- [tarima-cli](https://github.com/gextech/tarima-cli) support for CLI
- [gulp-tarima](https://github.com/gextech/gulp-tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt


## Alternatives

- [transformers](https://github.com/ForbesLindesay/transformers)
- [consolidate.js](https://github.com/tj/consolidate.js)
- [accord](https://github.com/jenius/accord)
