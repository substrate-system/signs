# signs
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

This is not as magical or robust as other implementations, but it is very small.
Look at [alien-signals](https://github.com/stackblitz/alien-signals) or
[@preact/signals](https://github.com/preactjs/signals) if you need more
magic or functionality.

[See the typescript docs](https://substrate-system.github.io/signs/).

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Install](#install)
- [Example](#example)
- [API](#api)
  * [`sign`](#sign)
  * [`sign.peek`](#signpeek)
  * [`effect`](#effect)
  * [`batch`](#batch)
  * [`computed`](#computed)
- [Modules](#modules)
  * [ESM](#esm)
  * [Common JS](#common-js)
  * [pre-built JS](#pre-built-js)
- [Develop](#develop)
  * [Example](#example-2)
  * [Filesizes](#filesizes)
  * [Test](#test)
- [See also](#see-also)

<!-- tocstop -->

</details>

## Install

```sh
npm i -S @substrate-system/signs
```

## Example

Counting clicks.

See [the live demo of this](https://substrate-system.github.io/signs/).

This example is only 886 bytes after minifying and gzipping.

```ts
import { effect, sign } from '@substrate-system/signs'
const qs = document.querySelector.bind(document)

const count = sign(0)

qs('#root').innerHTML = `
    <h1 class="count">${count.value}</h1>
    <button class="plus">Plus</button>
    <button class="reset">Reset</button>
`

effect(() => {
    qs('h1').innerHTML = count.value
})

qs('button.reset').addEventListener('click', ev => {
    ev.preventDefault()
    count.value = 0
})

qs('button.plus').addEventListener('click', ev => {
    ev.preventDefault()
    count.value++
})
```

## API

### `sign`

```ts
function sign<T> (value:T, options?: SignOptions):Sign<T>
```

### `sign.peek`

Get the sign's current value, but do not subscribe to that sign.

```ts
type Sign<T> = {
    value:T
    peek:()=>T
}
```

#### `.peek` Example

```js
import { sign, effect } from '@substrate-system/signs'
const delta = sign(0)
const count = sign(0)

effect(() => {
    // Update `count` without subscribing to `count`:
    count.value = count.peek() + delta.value;
})

// rerun the effect
delta.value = 1

// Do not rerun the effect,
// b/c we used `.peek`, not `.value`
count.value = 10
```

### `effect`

Call the subscriber function any time the sign's value changes.

```ts
function effect (fn:()=>any):()=>void
```

### `computed`

Create a new sign that will update whenever the root sign changes.

```ts
function computed<T> (fn:()=>T):Sign<T>
```

#### `computed` example

```js
import { sign, computed } from '@substrate-system/signs'

const hello = sign('hello')
const derived = computed(() => {
    return hello.value + ' world'
})

hello.value = 'goodbye'

console.log('derived value', derived.value)
// => 'goodbye world'
```

### `batch`

Combine multiple signal writes into one single update that is triggered
when the callback completes.

```ts
function batch<T> (fn:()=>T):T
```

#### `batch` Example

```js
import { sign, computed, effect, batch } from '@substrate-system/signs'

const name = sign('Jane')
const surname = sign('Doe')
const fullName = computed(() => name.value + ' ' + surname.value)

// Will be called initially and once after the batch completes
effect(() => console.log(fullName.value))
// => Jane Doe
// => Foo Bar

// Combines both signal writes into one update.
batch(() => {
    name.value = 'Foo'
    surname.value = 'Bar'
})
```


## Modules

This exposes ESM and common JS via [package.json `exports` field](https://nodejs.org/api/packages.html#exports).

### ESM
```ts
import { sign, effect, computed, batch, CycleError } from '@substrate-system/signs'
```

### Common JS
```js
const { sign, effect, computed, batch, CycleError } = require('@substrate-system/signs')
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
<script type="module" src="/signs.min.js"></script>
```

## Develop

### Example

Start a localhost server of the `example` directory:

```sh
npm start
```

### Filesizes

A convenient script that will tell you the filesize of the example app:

```sh
npm run size
```

### Test

```sh
npm test | npx tap-spec
```

## See also

* [alien-signals](https://github.com/stackblitz/alien-signals)
* [Ryan K Carniato - Revolutionary Signals](https://youtu.be/Jp7QBjY5K34)
* [Learn Why JavaScript Frameworks Love Signals By Implementing Them](https://youtu.be/1TSLEzNzGQM)
* [preactjs.com -- Signals](https://preactjs.com/guide/v10/signals/)
