let subscriber:null|(()=>any) = null
const subscriptions:Set<()=>any> = new Set()

export const CycleError = new Error('Cycle detected')

export class Sign<T=any|undefined> {
    static MAX_DEPTH = 100

    _value?:T
    _recursion:number
    MAX_DEPTH:number

    constructor (value?:T) {
        this._recursion = 0
        this._value = value
        this.MAX_DEPTH = Sign.MAX_DEPTH
    }

    get value ():T|undefined {
        if (subscriber) {
            subscriptions.add(subscriber)
        }
        this._recursion++
        if (this._recursion > this.MAX_DEPTH) {
            throw CycleError
        }
        setTimeout(() => {
            this._recursion = 0
        }, 0)
        return this._value
    }

    set value (newValue:T) {
        if (newValue !== this._value) {
            this._value = newValue
            subscriptions.forEach(fn => fn())
        }
    }
}

/**
 * Create a new sign
 */
export function sign<T=any> (value?:T) {
    const signal = new Sign<T>(value)
    return signal
}

/**
 * Add a new listener.
 *
 * @returns A function that will unsubscribe the effect.
 */
export function effect<T=any> (fn:()=>T):()=>void {
    // this is the clever part
    // because the `fn` accesses a signal's .value,
    // the signal adds it to `subscriptions`.
    // So in here we don't touch `subsroptions`, we assume that the given
    // function has a closure around its signal.

    subscriber = fn
    fn()
    subscriber = null

    return () => {
        subscriptions.delete(fn)
    }
}

// assume the given function has a closure around a signal
// so when the `fn` accesses the value, it subscribes
// and the new signal we create in here gets updated whenver the original
// signal gets updated
export function computed<T=any> (fn:()=>T) {
    const derived = sign<T>()
    effect(() => {
        derived.value = fn()
    })
    return derived
}
