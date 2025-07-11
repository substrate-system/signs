import { test } from '@substrate-system/tapzero'
import { sign, effect, computed } from '../src/index.js'

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
        console.log('the value...', value)
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

test('can pass in the max recursion depth', t => {
    const hello = sign('hello')
    // const { sign: hello, effect } = create('hello', {
    //     maxDepth: 50
    // })
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
    }
})
