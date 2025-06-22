import { test } from '@substrate-system/tapzero'
import { Sign, sign, effect, CycleError } from '../src/index.js'

test('create a signal', async t => {
    t.ok('ok', 'should be an example')
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
                // if you console log the .value in here, it breaks the test

                // console.log('**hello value**', hello.value)
                // console.log('**calls**', calls)
                t.equal(hello.value, '' + (calls - 1), 'Should update the value')
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

/**
 * Should *not* throw the "cycle detected" error, because this is an async loop.
 */
test('async Effects', async t => {
    const abc = sign('barrr')

    let count = 0

    const p = new Promise<void>((resolve, reject) => {
        try {
            effect(() => {
                t.ok(abc.value)
                if (count === 200) return resolve()
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

    t.equal(abc.value, '200', 'should update, not throw')
})
