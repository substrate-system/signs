import { test } from '@substrate-system/tapzero'
import { sign, effect, computed, batch, CycleError } from '../src/index.js'

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

test('throws Cycle Detected error', t => {
    t.plan(102) // 101 effect runs + 1 error message check
    const hello = sign('hello 0')
    let count = 0
    try {
        effect(() => {
            count++
            t.equal(hello.value, 'hello ' + (count - 1),
                'update from within the effect')
            hello.value = 'hello ' + count
        })
    } catch (_err) {
        const err = _err as typeof CycleError
        t.equal(err.message, CycleError.message, 'Should throw "cycle detected"')
        // Note: count will be 101 because the check happens after pushing to stack
    }
})

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
    t.plan(3)
    const delta = sign(1)
    const count = sign(0)

    effect(() => {
        // Update `count` without subscribing to `count`:
        count.value = count.peek() + delta.value
    })

    t.equal(count.value, 1,
        'should start 1 b/c delta is 1, and effect runs right away')

    // run the effect
    delta.value = 2
    t.equal(count.value, 3, 'count should be 3 (2 + 1)')

    // do not run the effect, b/c the effect did not access `count.value`
    count.value = 10
    t.equal(count.value, 10, 'count should be ten')
})

test('can pass in the max recursion depth', t => {
    t.plan(53)  // 1 sanity + 1 initial + 50 updates + 1 error message check
    const hello = sign('hello', { maxDepth: 50 })
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

test('subscribe to two signals', t => {
    t.plan(6)
    const hello = sign('hello')
    const foo = sign('foo')

    let calls = 0
    effect(() => {
        calls++
        if (calls === 1) {
            t.equal(hello.value, 'hello')
            t.equal(foo.value, 'foo', 'should call with initial state')
        }
        if (calls === 2) {
            t.equal(hello.value, 'world')
            t.equal(foo.value, 'foo', 'should update when any signal changes')
        }
        if (calls === 3) {
            t.equal(hello.value, 'world')
            t.equal(foo.value, 'bar', 'should update when any signal changes')
        }
    })

    hello.value = 'world'
    foo.value = 'bar'
})

test('batch - simple test', t => {
    t.plan(2)
    const counter = sign(0)
    let effectCallCount = 0

    effect(() => {
        effectCallCount++
        const _ = counter.value // subscribe to counter
    })

    // Initial effect call
    t.equal(effectCallCount, 1, 'should call effect initially')

    // Batch should defer the effect until completion
    batch(() => {
        counter.value = 1
    })

    t.equal(effectCallCount, 2, 'effect should be called after batch')
})

test('batch - basic functionality', t => {
    t.plan(3)
    const name = sign('Jane')
    const surname = sign('Doe')
    const fullName = computed(() => name.value + ' ' + surname.value)

    let effectCallCount = 0
    effect(() => {
        effectCallCount++
        const value = fullName.value
        if (effectCallCount === 1) {
            t.equal(value, 'Jane Doe', 'should start with initial value')
        } else if (effectCallCount === 2) {
            t.equal(value, 'Foo Bar', 'should update once after batch completes')
        }
    })

    // This should only trigger the effect once, not twice
    batch(() => {
        name.value = 'Foo'
        surname.value = 'Bar'
    })

    t.equal(effectCallCount, 2, 'effect should only be called twice (initial + batch)')
})

test('batch - nested batches', t => {
    t.plan(2)
    const counter = sign(0)
    let effectCallCount = 0

    effect(() => {
        effectCallCount++
        const _ = counter.value // subscribe to counter
    })

    // Initial effect call
    t.equal(effectCallCount, 1, 'should call effect initially')

    // Nested batches should defer until outermost completes
    batch(() => {
        batch(() => {
            counter.value = 1
            // Effect shouldn't be called yet
            t.equal(effectCallCount, 1,
                'effect should not be called during nested batch')
        })
        // Still inside outer batch, effect shouldn't be called yet
    })
    // Now effect should be called
})

test('batch - reading values during batch', t => {
    t.plan(2)
    const counter = sign(0)
    const double = computed(() => counter.value * 2)

    batch(() => {
        counter.value = 5
        // Should be able to read the updated value during batch
        t.equal(counter.value, 5, 'should read updated value during batch')
        t.equal(double.value, 10,
            'computed should update when accessed during batch')
    })
})
