import { test } from '@substrate-system/tapzero'
import { Sign, sign, effect, CycleError } from '../src/index.js'

test('create a signal', async t => {
    t.ok('ok', 'should be an example')
    const hello = sign('hello')

    t.equal(hello.value, 'hello', 'should return the value we passed in')
    hello.value = 'fooo'
    t.equal(hello.value, 'fooo', 'should reset the value')
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

test('A nested effect', t => {
    const hello = sign('hello')

    let calls = 0
    const unsub = effect(() => {
        calls++
        if (calls === 1) {
            t.equal(hello.value, 'hello', 'top level effect')
        } else {
            t.equal(hello.value, 'hi', 'top level subscription')
        }

        const unsub = effect(() => {
            if (calls === 1) {
                console.log('hello.value', hello.value)
            }

            if (calls === 1) {
                t.equal(hello.value, 'hello', 'nested effect works')
            } else {
                t.equal(hello.value, 'hi', 'nested subscription subscription')
            }
        })

        unsub()
    })

    hello.value = 'hi'
    unsub()
})

// test('test', t => {
//     t.plan(2)
//     t.ok(true)
// })

test('Update a value inside an effect', t => {
    t.plan(Sign.MAX_DEPTH + 1)  // 1 assertion in each recursion, + throws
    // t.plan(2)
    const hello = sign('hello')

    let calls = 0

    try {
        effect(() => {
            calls++
            if (calls === 1) {
                t.equal(hello.value, 'hello', 'Called with inital value')
            } else {
                t.equal(hello.value, '' + (calls - 1), 'Should reset the value')
            }
            hello.value = '' + calls
        })
    } catch (_err) {
        const err = _err as Error
        t.equal(err.message, CycleError.message, 'should throw the error')
    }

    // t.throws(() => {
    //     // unsub = effect(() => {
    // }, CycleError.message, 'should throw an error')

    // unsub()

    // this then throws the error for real
    // hello.value = '123'
})

// test('test', t => {
//     t.plan(2)
//     t.ok(true)
// })

// test('computed', t => {
//     // todo
// })
