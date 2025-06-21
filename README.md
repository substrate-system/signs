# package name here
![tests](https://github.com/substrate-system/signs/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/signs?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/signs)](https://packagephobia.com/result?p=@substrate-system/signs)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


A smaller, simpler [signal](https://github.com/tc39/proposal-signals).

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
import '@substrate-system/signs'
```

### Common JS
```js
const signs = require('@substrate-system/signs')
```

## Use

```js
import { sign } from '@substrate-system/signs'


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
