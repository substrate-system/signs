export const CycleError = new Error('Cycle detected')

const _effectStack: (() => any)[] = []
let _globalMaxDepth = 100
const DEFAULT_MAX_DEPTH = 100

export type SignOptions = {
    maxDepth?: number
}

export type Sign<T> = {
    value:T
    peek: ()=>T
}

export function sign<T> (value:T, options?: SignOptions):Sign<T> {
    const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH
    const subscriptions = new Set<()=>any>()

    // If this signal has a custom maxDepth, set it globally
    if (options?.maxDepth !== undefined) {
        _globalMaxDepth = maxDepth
    }

    return {
        get value (): T {
            const currentEffect = _effectStack[_effectStack.length - 1]
            if (currentEffect) {
                subscriptions.add(currentEffect)
            }

            return value
        },

        set value (newValue: T) {
            if (newValue === value) return
            value = newValue
            subscriptions.forEach(fn => fn())
        },

        peek () {
            return value
        }
    }
}

export function effect (fn:()=>any):()=>void {
    const effectFn = () => {
        if (_effectStack.length > _globalMaxDepth) {
            throw CycleError
        }
        _effectStack.push(effectFn)
        try {
            fn()
        } finally {
            _effectStack.pop()
        }
    }

    effectFn()

    // Unsubscribe function
    return () => {
        // This is a bit tricky. We can't easily remove this effect
        // from all signals it subscribed to without more tracking.
        // A simple way is to make the effect function a no-op.
        // A more robust implementation would have signals track their effects
        // and a way to remove them. For now, this is a simple approach.
        fn = () => {}
    }
}

export function computed<T> (fn:()=>T):Sign<T> {
    const initialValue = fn()
    const computedSign = sign(initialValue)

    effect(() => {
        computedSign.value = fn()
    })

    return computedSign
}
