export const CycleError = new Error('Cycle detected')

export class _Sign<T=any|undefined> {
    static MAX_DEPTH = 100

    _value?:T
    _subscriber:null|(()=>any)
    _recursion:number
    _subscriptions:Set<()=>any>
    MAX_DEPTH:number

    constructor (value?:T, opts?:{
        maxDepth?:number
    }) {
        this._recursion = 0
        this._subscriber = null
        this._value = value
        this.MAX_DEPTH = opts?.maxDepth || _Sign.MAX_DEPTH
        this._subscriptions = new Set()
    }

    get value ():T|undefined {
        if (this._subscriber) {
            this._subscriptions.add(this._subscriber)
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
            this._subscriptions.forEach(fn => fn())
        }
    }
}

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

// /**
//  * Create a new sign
//  */
// export function create<T=any|undefined> (value?:T, opts:{
//     maxDepth?:number
// } = {}):{
//     sign:Sign<T>;
//     effect:(cb:()=>any)=>(()=>void);
//     computed:(fn:()=>T)=>Sign<T>;
// } {
//     const maxDepth = opts?.maxDepth
//     const signal = new Sign<T>(value, { maxDepth })

//     // assume the given function has a closure around a signal
//     // so when the `fn` accesses the value, it subscribes,
//     // and the new signal we create in here gets updated whenver the original
//     // signal gets updated
//     function computed<T=any> (fn:()=>T):Sign<T> {
//         const derived = create<T>().sign
//         effect(() => {
//             derived.value = fn()
//         })
//         return derived
//     }

//     return { sign: signal, effect, computed }
// }

// /**
//  * Add a new listener.
//  *
//  * @returns A function that will unsubscribe.
//  */
// export function effect (fn:()=>any):()=>void {
//     // this is the clever part
//     // because the `fn` accesses a signal's .value,
//     // the signal adds it to `subscriptions`.
//     // So in here we don't need to touch `subsroptions`; we assume that the
//     // given function has a closure around its signal.

//     signal._subscriber = fn
//     fn()
//     signal._subscriber = null

//     return () => {
//         signal._subscriptions.delete(fn)
//     }
// }
