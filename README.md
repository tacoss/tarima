# Tarima

[![Build Status](https://travis-ci.org/tacoss/tarima.png?branch=next)](https://travis-ci.org/tacoss/tarima)
[![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima)
[![Coverage Status](https://codecov.io/github/tacoss/tarima/coverage.svg?branch=next)](https://codecov.io/github/tacoss/tarima)
[![Known Vulnerabilities](https://snyk.io/test/npm/tarima/badge.svg)](https://snyk.io/test/npm/tarima)

![Tarima](tarima.png)

```bash
$ npm install tarima --save-dev
```

**Tarima** is a pre-processing tool based on filename extensions.

## 1.0 - How it works

Lets say `view.js.rv.pug` will produce a pre-compiled template for Ractive, which is rendered from pug, etc.

If you omit the `js` extension then `view.rv.pug` will produce markup, since `html` is the default extension for the Ractive engine.

> You can add as many extensions you want, whilst the output is valid input for the next renderer in the chain.

### 1.1 - Parsing

`load(filename, options)` &mdash; Shortcut for calling `parse()` from reading the given filename with `fs.readFileSync()`.

See below. &darr;

`parse(filename, source, options)`  &mdash; Primary method for turning the given source into a abstract representation of itself.

> The filename is required but _not required_ to exists, is just a hint for tarima to understand what to do with it.

The resulting object will contain a `render()` callback and `params` object, respectively:

- `view.render(locals, callback)`  &mdash; Performs the transpilation on the given source, producing a new source.

- `view.params` &mdash; An object like:

```javascript
{
  "filename": "view.rv.pug",
  "options": {}, // passed options to the factory
  "source": "<x>y</x>",
  "parts": ["ract", "pug"],
  "name": "view",
  "data": {}, // any data passed as front-matter
  "deps": [], // all imported-or-required sources
  "locals": {}, // values passed from the callback
  "isScript": false, // true for all exported modules
}
```

### 1.2 - Rendering

Example:

```javascript
const tarima = require('tarima');

const view = tarima.parse('view.rv.pug', 'x {{"y"}}');

// direct
view.render((err, result) => {
  console.log(err, result);
});
```

### 1.3 - Bundling

`view.bundle(locals, callback)`  &mdash; Performs the transpilation on the given source, and turn it into a new module.

Example:

```javascript
// bundled
view.bundle(locals, (err, result) => {
  console.log(err, result);
});
```

#### bundleOptions

- `cwd` &mdash; Save all file paths relative to this directory
- `cache` &mdash; Cache object being used by Rollup.js
- `rollup` &mdash; Configuration object used by Rollup.js
- `fusebox` &mdash; Configuration object used by FuseBox
- `webpack` &mdash; Configuration object used by Webpack
- `bundler` &mdash; Shortcut for setting the given bundler as default

You can enable an specific bundler in several ways:

```bash
# from any source
/**
---
$bundler: fusebox
---
*/

# from settings
{
  "bundleOptions": {
    "bundler": "fusebox",
    "webpack": {},
  }
}

# from command-line
$ tarima -B fusebox
```

Settings under `bundleOptions.webpack` has precedence over `bundleOptions.bundler` and therefore `webpack` is used as bundler.

The former option (`bundleOptions.bundler`) is preferred if no advanced settings are needed.

### 1.4 - Front Matter

All parsed files can use a front-matter block for local data.

```jade
//-
  ---
  title: Untitled
  $render: other/layout.hbs
  extended: !include ../path/to.yml
  ---

h1= title + extended.some.value
```

Note you can merge additional files using the `!include` directive within any front-matter block.

#### Special keys

Tarima use some predefined keys in order to customize certain aspects of rendering, transpilation or bundling individually:

- `$format` &mdash; This value is passed directly as `format` option for rollup, [available formats](https://github.com/rollup/rollup/wiki/JavaScript-API#format) are: `amd`, `js`, `es6`, `iife`, `umd`
- `$bundle` &mdash; This value will be used as the exported symbol on bundles
- `$render` &mdash; Render the current output as `yield` for the given source file
- `$bundler` &mdash; Set a custom bundler (instead of the default) for this source only
- `$globals` &mdash; Global variables to bundle explicitly
- `$external` &mdash; External modules to bundle explicitly
- `$transpiler` &mdash; Set the transpiler for all ES6 sources

## 2.0 - Supported engines

You can install the following dependencies for specific support:

- `npm install vue-template-compiler` &rarr; `.vue` component files and templates
- `npm install coffee-script` &rarr; `.coffee` and `.litcoffee` (aka `.coffee.md`)
- `npm install postcss` &rarr; `.post.css` sources (experimental)
- `npm install pug` &rarr; `.pug` and `.jade` (legacy)
- `npm install sass-node` &rarr; `.sass` and `.scss`
- `npm install less` &rarr; `.less`
- `npm install ejs` &rarr; `.ejs`
- `npm install styl` &rarr; `.styl`
- `npm install handlebars` &rarr; `.hbs`
- `npm install ractive` &rarr; `.ract` and `.rv`
- `npm install kramed` &rarr; `.md`, `.mkd`
- `npm install moonjs` &rarr; `.sv` and `.moon`
- `npm install marko` &rarr; `.sv` and `.marko`
- `npm install svelte` &rarr; `.sv` and `.svelte`
- `npm install buble` &rarr; `.jsx` and `.es6.js`
- `npm install traceur` &rarr; `.jsx` and `.es6.js`
- `npm install typescript` &rarr; `.ts` and `.tsx`
- `npm install liquid-node` &rarr; `.sv` and `.liquid`
- `npm install babel-core@^5` &rarr; `.jsx` and `.es6.js`

> Tarima doesn't ship any dependency for the supported engines, is your responsibility to install whatever you will need.

### 2.1 - ES6 support

Tarima supports `.es6` through [Bublé](http://buble.surge.sh/) which is so damn fast and lot constrained than Babel, of course you can use Traceur too.

Babel &mdash; `npm install babel-core@^6 babel-preset-es2015` to get the latest babel version with `es2015` as default preset:

```json
{
  "bundleOptions": {
    "babel": {
      "presets": [["es2015", {}]]
    }
  }
}
```

### 2.2 - Globals (and data)

As part of the transpilation process you can put any value as global using the `globals` option:

```javascript
tarima.parse('x.js', '/* global foo */console.log(foo);', {
  globals: {
    foo: 'bar'
  },
}).render((err, result) => {
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

Local `data` (either passed manually and front-matter) is always merged with globals, e.g.

```js
/**
---
foo: bar
---
*/

/* global foo */
console.log(foo);
```

Resulting into:

```js

var foo = "bar";
console.log(foo);
```

> Using this technique your code will always be valid on syntax terms. ;)

The bundler will merge up all `importee.data` with the `importer.data` before processing.

> Note globals are injected during the `post-filter`for all script sources, see below.

#### Filters

Tarima handle sources this way: `read -> pre-filter -> compile -> post-filter`.

Passing a function as the `filter` option brings you the ability to modify the partial view during the `pre-filter` phase.

#### Locals

All supported templates can take locals, you can pass any values when calling `.render(locals, cb)` to draw them during the compile (or render) process.

## 3.0 - Command Line Interface

1. It can take any amount of files and produce different outputs based on supplied configuration, you can filter out some files, rename different subests, bundle them, etc.

2. Provides a simple hook system to catch-all non supported files, then are piped out to different handlers if they exists.

3. Otherwise, all non supported files are simply copied.

It comes with basic dependency tracking, so any change will affect only its dependent sources.

### 3.1 - Basic usage

The best way is adding tarima as dependency, global or locally, and then setup your `package.json` for using it:

```javascript
{ // package.json
  "scripts": {
    "dev": "tarima -w",
    "build": "tarima -f"
  }
}
```

Now calling `yarn dev` will start in watch-mode and `yarn build` will force a complete rebuild of all sources.

The default source directory is `./src` if you need anything else you can provide arguments, e.g. `tarima -S foo -S bar` which will watch more directories.

> Use directory names only without globs as they will be compiled like `{foo,bar}/**`

Also you can specify this option in your `package.json` file:

```javascript
{
  "tarima": {
    "src": ["foo", "bar"]
  }
}
```

### 3.2 - Handling sources

All files then are read or watch from given directories, any change will trigger a compilation process.

This process will transpile the given source file if tarima supports it, if not it will be piped or copied as stated above.

Basically you can write `./src/index.md` and obtain `./build/src/index.html` as result.

> You'll notice that the source's filepath will be maintained as is, because you can specify multiple source directories and it will be difficult to resolve everything.

You can use the `rename` option for cut-off directories from the destination filepath:

```javascript
{ // package.json
  "tarima": {
    "rename": [
      "**:{basedir/1}/{fname}"
    ]
  }
}
```

This will match `./src/index.md` to `./build/index.html` directly.

> The `{basedir/1}` expression will split the source's _dirname_ and remove the first directory from its left, e.g. `./dest/src/file.ext` becomes `./dest/file.ext` and such.

Tarima will let you organize your source files as your pleasure, and them process them as you expect, to write them finally wherever you want.

Not a complete building tool but damn useful for daily work.

### 3.3 - Notifications

Tarima will use `node-notifier` to display some feedback about the process.

You can customize some values of the notification popup:

```javascript
{ // package.json
  "tarima": {
    "notifications": {
      "title": "My app",
      "okIcon": "./success.png",
      "errIcon": "./failure.png"
    }
  }
}
```

### 3.4 - Caching support

Tarima is efficient by tracking dependencies using a json-file for caching, this way on each startup nothing will be compiled unless they are changes or dirty files.

By default the cache file is `.tarima`, but you use a different file specifying the `cacheFile` option:

```javascript
{ // package.json
  "tarima": {
    "cacheFile": "tmp/cache.json"
  }
}
```

### 3.5 - Bundle support

By default all scripts are transpiled only, you must enable the `bundle` option for globally treat each entry-point as bundle.

This option can be `true` to enable bundling on all files (filtered),  a glob string, or an array of globs.

> Files matching the globs will be treated as entry-points, see below.

Or locally set the `$bundle` option as front-matter:

```javascript
/**
---
$bundle: true
---
*/

import { getValue } from './other/script';

export default function () {
  return getValue(...arguments);
};
```

> When using `$bundle` you don't need to declare it on each imported file, only within the entry-points you want to bundle.

On javascript you can use the tilde prefix for loading sources from the `cwd`, e.g.

```js
import pkg from '~/package.json';

console.log(pkg.version);
```

Even stylesheets are entry-points by nature:

```less
@import 'colors.less';

a { color: @link-text-color; }
```

So you don't need anything else to bundle stylesheets. ;)

### 3.6 - Ignoring sources

Ignoring sources will skip all matched files from watching, Tarima will never track them for any purpose.

You can use the `ignoreFiles` to provide a glob-based file with patterns to be ignored.

Example:

```javascript
{ // package.json
  "tarima": {
    "ignoreFiles": [".gitignore"]
  }
}
```

Any `.gitignore` compatible format is supported.

### 3.7 - Filtering sources

Filtered sources are watched but not used for any transpilation process, they are ignored because they should be imported from any other entry-point file.

A common pattern is ignoring everything which starts with underscore:

```javascript
{ // package.json
  "tarima": {
    "filter": [
      "!_*",
      "!_*/**",
      "!**/_*",
      "!**/_*/**"
    ]
  }
}
```

### 3.8 - Rollup.js

You can provide a configuration file for [rollup](https://github.com/rollup/rollup) using the `rollupFile` option:

```javascript
{ // package.json
  "tarima": {
    "rollupFile": "rollup.config.js"
  }
}
```

The `src` and `dest` options are ignored since tarima will override them internally.

You can setup the specific behavior of bundling using `bundleOptions`:

```javascript
{ // package.json
  "tarima": {
    "bundleOptions": {
      "transpiler": "babel"
      "less": { "plugins": [] }
    }
  }
}
```

All given options are passed directly when calling the `view.bundle()` method.

### 3.9 - Locals

You can pass a global `locals` object accesible for all parsed templates, this way you can reuse anything do you need:

```javascript
{ // package.json
  "tarima": {
    "locals": {
      "title": "My project"
    }
  }
}
```

Given locals are passed directly when calling any `render()` method on Tarima.

### 3.10 - Plugins

Using the `plugins` option you can declare scripts or modules to be loaded and perform specific tasks, common plugins are:

- `talavera` &mdash; support for sprites and lazy loading
- `tarima-lr` &mdash; LiveReload integration (light-weight)
- `tarima-bower` &mdash; quick support for optional bower files
- `tarima-browser-sync` &mdash; BrowserSync integration (heavy)

Some plugins can take its configuration from `pluginOptions` or directly from the main configuration:

```javascript
{ // package.json
  "tarima": {
    "pluginOptions": {
      "bower": { "bundle": true }
    }
  }
}
```

All `plugins` are loaded automatically by Tarima on the startup.

> `devPlugins` are loaded only if the dev-mode is enabled (aka `NODE_ENV=development`)

### 3.11 - Settings

- `cwd` &mdash; project's directory
- `src` &mdash; source directories to process
- `dest` &mdash; destination for generated files
- `public` &mdash; public directory for serving assets
- `cacheFile` &mdash; store processed details from files
- `rename` &mdash; declare single rename operations, e.g. `M:N`
- `filter` &mdash; set which files will be ignored from processing
- `ignore` &mdash; skip sources, files, directories or globs from anything
- `ignoreFiles` &mdash; extract `ignore` patterns from these files (see above)
- `watch` &mdash; additional files and directories to watch, globs will not work!
- `bundle` &mdash; enable bundling if it's `true`, or just files matching this
- `bundleOptions` &mdash; enable settings for all processed sources (see above)
- `plugins` &mdash; enable plugins for further processing, e.g. `talavera`
- `devPlugins` &mdash; same as above, but only if `NODE_ENV=development` (e.g. `tarima-lr`)
- `pluginOptions` &mdash; specific options for all enabled plugins
- `flags` &mdash; given flags from CLI (or custom)
- `locals` &mdash; data passed to all rendered sources
- `reloader` &mdash; this script is invoked after any change
- `notifications` &mdash; custom settings for `node-notifier`

**Example of "tarima" settings**

```json
{
  "cwd": ".",
  "src": [
    "lib/myapp/templates",
    "lib/myapp_web/assets"
  ],
  "watch": [
    "lib/myapp/application.js",
    "lib/myapp/chat",
    "lib/myapp/models",
    "lib/myapp/services",
    "lib/myapp_web/controllers",
    "lib/myapp_web/middlewares",
    "lib/myapp_web/middlewares.js",
    "lib/myapp_web/policies.js",
    "lib/myapp_web/routes.js",
    "config",
    ".env",
    "package.json"
  ],
  "filter": [
    "!_*",
    "!**/_*",
    "!**/_*/**"
  ],
  "bundle": [
    "**/templates/**",
    "**/javascripts/**"
  ],
  "rename": [
    "**/templates/**:{fullpath/2}",
    "**/assets/**:public/{fullpath/3}"
  ],
  "ignoreFiles": [
    ".gitignore"
  ],
  "devPlugins": [
    "tarima-lr"
  ],
  "plugins": [
    "talavera",
    "tarima-bower"
  ],
  "pluginOptions": {
    "talavera": {
      "dest": "public/images"
    },
    "tarima-lr": {
      "serve": "build/public",
      "timeout": 1000
    },
    "tarima-bower": {
      "vendor": "build/public/vendor",
      "bundle": true
    }
  },
  "bundleOptions": {
    "sourceMapFile": false,
    "bundleCache": false,
    "entryCache": false,
    "extensions": {
      "js": "es6",
      "css": "less"
    },
    "less": {
      "plugins": [
        "less-plugin-autoprefix"
      ]
    },
    "rollup": {
      "plugins": [
        "rollup-plugin-node-resolve",
        "rollup-plugin-commonjs"
      ],
      "rollup-plugin-node-resolve": {
        "module": true,
        "jsnext": true,
        "main": true,
        "browser": true
      }
    }
  }
}
```
