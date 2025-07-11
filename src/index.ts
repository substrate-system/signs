export const CycleError = new Error('Cycle detected')

/** @global */
let _subscriber:null|(()=>any) = null
/** @global */
const _subscriptions = new Set<()=>any>()

/**
 * The given `fn` has a closure around a sign.
 *
 * This is the clever part. In the getter for `.value` on a Sign,
 * we add the effect function to a global set of subscriptions. Since the effect
 * calls `.value` on a sign, it is added to the list, then called any time
 * se use the `.value` setter.
 *
 * @param fn Function that calls a `sign.value`.
 * @returns A function that will unsubscribe.
 */
export function effect (fn:()=>any):()=>void {
    _subscriber = fn
    fn()
    _subscriber = null
    return _subscriptions.delete.bind(_subscriptions, fn)
}

export function computed<T=any> (fn:()=>T):ReturnType<typeof sign<T>> {
    const derived = sign<T>()
    effect(() => {
        derived.value = derived.value = fn()
    })

    return derived
}

export type Sign<T> = {
    value:T
}

export function sign<T> (value?:T, opts:{ maxDepth?:number } = {}):({ value }) {
    const MAX_DEPTH = opts.maxDepth || 100
    let _recursion = 0

    return {
        get value ():T|undefined {
            if (_subscriber) {
                _subscriptions.add(_subscriber)
            }

            _recursion++
            if (_recursion > MAX_DEPTH) {
                throw CycleError
            }

            return value
        },

        set value (newValue:T) {
            if (newValue === value) return
            value = newValue
            _subscriptions.forEach(fn => fn())
        }
    }
}
