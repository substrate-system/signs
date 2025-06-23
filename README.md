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
- [Modules](#modules)
  * [ESM](#esm)
  * [Common JS](#common-js)
  * [pre-built JS](#pre-built-js)
- [Example](#example)
- [API](#api)
  * [`create (value, opts)`](#create-value-opts)
  * [`effect (fn)`](#effect-fn)
  * [`computed`](#computed)
- [See also](#see-also)

<!-- tocstop -->

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

The clever part is how the `effect`s are handled. We pass in a function, and
because the function accesses a signal's `.value`, the signal adds it
to `subscriptions`.

When you call `create('value')`, it creates a closure around the signal and
the `effect` function, so there is not a global stack for effect functions.

```js
import { create } from '@substrate-system/signs'

const { sign, effect } = create('hello')

console.log(sign.value)
// => 'hello'

// subscribe
effect(() => {
    console.log(sign.value)
    // 'hello'
    // 'hi'
})

sign.value = 'hi'
```

## API

### `create (value, opts)`

Create a new instance. Will return a sign instance, effect function, and
computed function.

```ts
export function create<T=any|undefined> (value?:T, opts:{
    maxDepth?:number
} = {}):{
    sign:Sign<T>;
    effect:(cb:()=>any)=>(()=>void);
    computed:(fn:()=>T)=>Sign<T>;
}
```

### `effect (fn)`

Subscribe to a sign by accessing its value within the callback function.
Effects are where you consume a sign. It could be at the end of a chain of
computed signs.

It returns a function that will unsubscribe.

```ts
function effect (fn:()=>any):()=>void
```

> [!NOTE]  
> The `effect` function will automatically filter out multiple calls with the
> same value, using a `===` comparison.

```js
const { sign, effect } = create('hello')

// this only gets called once,
// because the second update has the same value.
effect(() => {
    console.log(sign.value)
    // => 'hello'
})

sign.value = 'hello'
```

#### errors

This will throw a `CycleError` if you update the signal from within the effect
function.

By default the stack size is 100. If an effect synchronously runs more than 100
times, it will throw.

You can set a different size by passing in a second argument to `create`.

```js
let calls = 0

const { sign, effect } = create('hello', {
    maxDepth: 50
})

// don't do this
// it will throw
effect(() => {
    console.log(sign.value)

    calls++
    sign.value = '' + calls
})
```


#### `effect` example

```js
import { create } from '@substrate-system/signs'
const { sign, effect } = create('hello')

effect(() => {
    console.log(sign.value)
    // => 'hello'
    // => 'hello again'
})

// these updates trigger the effect function.
sign.value = 'hello again'
```

### `computed`

Create a new signal that is derived from another signal. Any effects will be
updated when the original signal changes.

```ts
function computed<T=any> (fn:()=>T):Sign<T>
```


## See also

* [alien-signals](https://github.com/stackblitz/alien-signals)
* [Ryan K Carniato - Revolutionary Signals](https://youtu.be/Jp7QBjY5K34)
* [Learn Why JavaScript Frameworks Love Signals By Implementing Them](https://youtu.be/1TSLEzNzGQM)
* [preactjs.com -- Signals](https://preactjs.com/guide/v10/signals/)
