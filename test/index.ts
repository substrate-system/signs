import { test } from '@substrate-system/tapzero'
import { sign, effect } from '../src/index.js'

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
    }, 1)
})
