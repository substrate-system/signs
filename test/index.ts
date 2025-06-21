import { test } from '@substrate-system/tapzero'
import { sign, effect, CycleError } from '../src/index.js'

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
    const hello = sign('hello')

    let foo = 0

    t.throws(() => {
        effect(() => {
            foo++
            console.log('foooo', foo)
            console.log('value', hello.value)
            if (foo === 1) {
                t.equal(hello.value, 'hello')
            }
            hello.value = 'abc'
        })
    }, CycleError.message, 'should throw an error')
})

// test('test', t => {
//     t.plan(2)
//     t.ok(true)
// })

// test('computed', t => {
//     // todo
// })
