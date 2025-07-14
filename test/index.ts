import { test } from '@substrate-system/tapzero'
import { sign, effect, computed, CycleError } from '../src/index.js'

test('create a signal', async t => {
    t.plan(2)
    const hello = sign('hello')

    t.equal(hello.value, 'hello', 'should return the value we passed in')
    hello.value = 'fooo'
    t.equal(hello.value, 'fooo', 'should update the value')
})

test('effect', (t) => {
    t.plan(2)
    const hello = sign('hello')

    let calls = 0
    const unsub = effect(() => {
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

test('computed', (t) => {
    const hello = sign('hello')
    const derived = computed(() => {
        return hello.value + ' world'
    })

    t.equal(derived.value, 'hello world', 'should start with the value')

    hello.value = 'goodbye'

    t.equal(derived.value, 'goodbye world',
        'should update when original signal changes')
})

test('Multiple updates with the same value', t => {
    t.plan(1)
    const hello = sign('hello')
    const unsub = effect(() => {
        t.equal(hello.value, 'hello', 'should call the subscription once')
    })

    hello.value = 'hello'
    hello.value = 'hello'

    unsub()
})

test('stop listening', (t) => {
    const hello = sign('hello')
    t.plan(2)

    let calls = 0
    const stop = effect(() => {
        if (calls === 0) {
            t.equal(hello.value, 'hello', 'should get first value')
        } else {
            t.equal(hello.value, 'hi', 'should get second value')
        }
        calls++
        const value = hello.value
        console.log('value...', value)
    })

    hello.value = 'hi'
    stop()
    // should not get this update
    hello.value = 'hello again'
})

// test('throws Cycle Detected error', t => {
//     t.plan(100)
//     const hello = sign('hello 0')
//     let count = 0
//     try {
//         effect(() => {
//             count++
//             t.equal(hello.value, 'hello ' + (count - 1),
//                 'update within the effect')
//             hello.value = 'hello ' + count
//         })
//     } catch (_err) {
//         const err = _err as typeof CycleError
//         t.equal(err.message, CycleError.message, 'Should throw "cycle detected"')
//         t.equal(count, 97, 'should do 100 calls by default')  /* Why is this
//             not 100? */
//     }
// })

test('multiple subscriptions', t => {
    const hello = sign('hello')
    const foo = sign('foo')
    t.plan(2)

    let helloCount = 0
    effect(() => {
        helloCount++
        console.log(hello.value)
    })

    let fooCount = 0
    const stop = effect(() => {
        fooCount++
        console.log(foo.value)
    })

    effect(() => {
        console.log('foo value', foo.value)
    })

    stop()

    effect(() => {
        helloCount++
        console.log('hello value', hello.value)
    })

    t.equal(helloCount, 2)
    t.equal(fooCount, 1)
})

test('peek does not subscribe', t => {
    t.plan(1)
    const hello = sign('hello')
    let calls = 0

    effect(() => {
        calls++
        hello.peek()
    })

    hello.value = 'world'
    t.equal(calls, 1, 'should not have been called again')
})

// test('can pass in the max recursion depth', t => {
//     t.plan(50)
//     const hello = sign('hello', { maxDepth: 50 })
//     t.equal(hello.value, 'hello', 'sanity')

//     let calls = 0

//     try {
//         effect(() => {
//             console.log('hello.value', hello.value)
//             calls++
//             if (calls === 1) {
//                 t.equal(hello.value, 'hello', 'Called with inital value')
//             } else {
//                 t.equal(hello.value, '' + (calls - 1), 'Should update the value')
//             }

//             hello.value = '' + calls
//         })
//     } catch (_err) {
//         const err = _err as Error
//         t.equal(err.message, CycleError.message, 'should throw the error')
//     }
// })
