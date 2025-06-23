import { test } from '@substrate-system/tapzero'
import { Sign, create, CycleError } from '../src/index.js'

test('create a signal', async t => {
    t.plan(2)
    const { sign: hello } = create('hello')

    t.equal(hello.value, 'hello', 'should return the value we passed in')
    hello.value = 'fooo'
    t.equal(hello.value, 'fooo', 'should update the value')
})

test('effect', async (t) => {
    t.plan(2)
    const { sign, effect } = create('hello')

    const hello = sign
    let calls = 0
    const unsub = await effect(() => {
        calls++
        const value = hello.value
        if (calls === 1) {
            t.equal(value, 'hello',
                'should call the effect with the inital value')
        } else {
            t.equal(value, 'hi', 'should get updated with the new value')
        }
    })

    setTimeout(() => {
        hello.value = 'hi'
        unsub()

        // check that we are unsubscribed
        hello.value = 'fooo'
    }, 1)
})

test('A nested effect', async t => {
    t.plan(4)
    const { sign, effect } = create('hello')
    const hello = sign

    let calls = 0
    const unsub = await effect(async () => {
        calls++
        if (calls === 1) {
            t.equal(hello.value, 'hello', 'top level effect')
        } else {
            t.equal(hello.value, 'hi', 'top level subscription')
        }

        const unsub = await effect(() => {
            if (calls === 1) {
                t.equal(hello.value, 'hello', 'nested effect works')
            } else {
                t.equal(hello.value, 'hi', 'nested subscription')
            }
        })

        unsub()
    })

    hello.value = 'hi'
    unsub()
})

test('Multiple updates with the same value', async t => {
    t.plan(1)
    const { sign: hello, effect } = create('hello')
    const unsub = await effect(() => {
        t.equal(hello.value, 'hello', 'should call the subscription once')
    })

    hello.value = 'hello'
    hello.value = 'hello'

    unsub()
})

/**
 * Should throw an error b/c stack overflow.
 */
test('Update a value inside an effect', t => {
    const { sign: hello, effect } = create('hello')
    t.plan(Sign.MAX_DEPTH + 2)  // 1 assertion in each recursion, + extras

    let calls = 0

    try {
        effect(() => {
            calls++
            if (calls === 1) {
                t.equal(hello.value, 'hello', 'Called with inital value')
            } else {
                t.equal(hello.value, '' + (calls - 1), 'Should update the value')
            }
            hello.value = '' + calls
        })
    } catch (_err) {
        const err = _err as Error
        t.equal(err.message, CycleError.message, 'should throw the error')
    }

    const fooo = create('fooo').sign
    effect(() => {
        t.equal(fooo.value, 'fooo', 'Can listen to a second signal')
    })
})

/**
 * Should *not* throw the "cycle detected" error, because this is an async loop.
 */
test('async Effects', async t => {
    t.plan(202)
    const { sign: abc, effect } = create('barrr')
    let count = 0

    const p = new Promise<void>((resolve, reject) => {
        try {
            effect(() => {
                t.ok(abc.value)
                if (count === 200) return resolve()  // default limit is 100
                setTimeout(() => {
                    count++
                    abc.value = '' + count
                }, 1)
            })
        } catch (_err) {
            const err = _err as Error
            console.log('**error**', err)
            reject(err)
        }
    })

    await p

    t.equal(abc.value, '200',
        'should update, not throw, b/c this is an async loop, not recursive stack')
})

let hello
let bonusGreeting
let effect
test('computed', t => {
    const { sign: _hello, computed, effect: _effect } = create('hello')
    hello = _hello
    effect = _effect
    t.ok(hello, 'create a signal')

    bonusGreeting = computed(() => {
        return hello.value + ', hi...'
    })

    t.ok(bonusGreeting instanceof Sign, 'should return a new Sign')

    hello.value = 'hello, world'

    t.equal(bonusGreeting.value, 'hello, world, hi...',
        'computed signal should update when the original updates')
})

test('subscribe to a computed signal', t => {
    hello.value = 'hello again'

    effect(() => {
        t.equal(bonusGreeting.value, 'hello again, hi...',
            'can subscribe via effect')
    })
})

test('can pass in the max recursion depth', t => {
    const { sign: hello, effect } = create('hello', {
        maxDepth: 50
    })
    t.equal(hello.value, 'hello', 'sanity')

    let calls = 0

    try {
        effect(() => {
            calls++
            if (calls === 1) {
                t.equal(hello.value, 'hello', 'Called with inital value')
            } else {
                t.equal(hello.value, '' + (calls - 1), 'Should update the value')
            }
            hello.value = '' + calls
        })
    } catch (_err) {
        const err = _err as Error
        t.equal(err.message, CycleError.message, 'should throw the error')
        t.equal(calls, 50, 'should set the max recursion depth')
    }
})
