let subscriber:null|(()=>any) = null
const subscriptions:Set<()=>any> = new Set()

class Sign<T=any|undefined> {
    _value?:T

    constructor (value?:T) {
        this._value = value
    }

    get value ():T|undefined {
        if (subscriber) {
            subscriptions.add(subscriber)
        }
        return this._value
    }

    set value (newValue:T) {
        this._value = newValue
        subscriptions.forEach(fn => fn())
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
    subscriber = fn
    fn()
    subscriber = null

    return () => {
        subscriptions.delete(fn)
    }
}

export function computed<T=any> (fn:()=>T) {
    const derived = sign<T>()
    effect(() => {
        derived.value = fn()
    })
    return derived
}
