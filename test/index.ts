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

test('Multiple updates with the same value', t => {
    t.plan(1)
    const hello = sign('hello')
    const unsub = effect(() => {
        console.log('hello.value', hello.value)
        t.equal(hello.value, 'hello', 'should call the subscription once')
    })

    hello.value = 'hello'
    hello.value = 'hello'

    unsub()
})

test('Update a value inside an effect', t => {
    t.plan(Sign.MAX_DEPTH + 2)  // 1 assertion in each recursion, + extras
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

    const fooo = sign('fooo')
    effect(() => {
        t.equal(fooo.value, 'fooo', 'Can listen to a second signal')
    })
})

test('async Effects', t => {
    const fooo = sign('fooo')

    let count = 0
    // const tester = () => setTimeout(() => {
    //     console.log('count', count)
    //     count++
    //     fooo.value = '' + count
    //     console.log('foo value', fooo.value)
    //     tester()
    // }, 0)

    try {
        effect(() => {
            console.log('**in here**', fooo.value)
            console.log('**count**', count)
            console.log('fooo recursion**', fooo._recursion)
            t.equal(fooo.value, 'fooo', 'should call with initial value')
            // tester()
            setTimeout(() => {
                count++
                fooo.value = '' + count
            }, 1)
        })
    } catch (_err) {
        const err = _err as Error
        console.log('**********************', err)
        t.ok(err)
    }
})
