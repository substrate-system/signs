# package name here
[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/signs/nodejs.yml?style=flat-square)](https://github.com/substrate-system/signs/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/signs?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/signs?)](https://packagephobia.com/result?p=@substrate-system/signs)
[![GZip size](https://flat.badgen.net/bundlephobia/minzip/@substrate-system/signs?color=green)](https://bundlephobia.com/package/@substrate-system/signs)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


A smaller, simpler [signals](https://github.com/tc39/proposal-signals).

[See a the typescript docs](https://substrate-system.github.io/signs/)

<details><summary><h2>Contents</h2></summary>
<!-- toc -->
</details>

## Install

```sh
npm i -S @substrate-system/signs
```

## Modules

This exposes ESM and common JS via [package.json `exports` field](https://nodejs.org/api/packages.html#exports).

### ESM
```js
import { Sign, create, CycleError } from '@substrate-system/signs'
```

### Common JS
```js
const signs = require('@substrate-system/signs')
```

### pre-built JS
This package exposes minified JS files too. Copy them to a location that is
accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/signs/dist/index.min.js ./public/signs.min.js
```

#### HTML
```html
<script type="module" src="./signs.min.js"></script>
```

## Example

```js
import { create } from '@substrate-system/signs'

const { sign, effect } = create('hello')

constole.log(sign.value)
// => 'hello'

// subscribe
effect(() => {
    console.log(sign.value)
    // 'hello'
    // 'hi'
})

sign.value = 'hi'
```

## See also

* [alien-signals](https://github.com/stackblitz/alien-signals)
* [Ryan K Carniato - Revolutionary Signals](https://youtu.be/Jp7QBjY5K34)
* [Learn Why JavaScript Frameworks Love Signals By Implementing Them](https://youtu.be/1TSLEzNzGQM)
* [preactjs.com -- Signals](https://preactjs.com/guide/v10/signals/)
