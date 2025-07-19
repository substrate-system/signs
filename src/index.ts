export const CycleError = new Error('Cycle detected')

const _effectStack: (() => any)[] = []
let _globalMaxDepth = 100
const DEFAULT_MAX_DEPTH = 100

// Batching state
let _batchDepth = 0
let _batchedEffects: ((() => any) & { _execute?: () => void })[] = []

export type SignOptions = {
    maxDepth?:number
}

export type Sign<T> = {
    value:T
    peek:()=>T
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

            // Always notify subscribers immediately
            // During batching, effects will queue themselves instead of executing
            subscriptions.forEach(fn => fn())
        },

        peek () {
            return value
        }
    }
}

export function effect (fn:()=>any):()=>void {
    let isActive = true

    const effectFn = () => {
        if (!isActive) return

        if (_batchDepth > 0) {
            // We're in a batch - queue this effect instead of executing immediately
            if (!_batchedEffects.includes(effectFn)) {
                _batchedEffects.push(effectFn)
            }
            return
        }

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

    // Add a way to execute the effect bypassing batch queue
    effectFn._execute = () => {
        if (!isActive) return

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
        isActive = false
    }
}

export function computed<T> (fn:()=>T):Sign<T> {
    const initialValue = fn()
    const computedSign = sign(initialValue)
    let isStale = false

    const updateComputed = () => {
        if (isStale) {
            const newValue = fn()
            computedSign.value = newValue
            isStale = false
        }
    }

    // Override the getter to update if stale when accessed
    const originalDescriptor = Object.getOwnPropertyDescriptor(computedSign, 'value')!
    Object.defineProperty(computedSign, 'value', {
        get () {
            if (isStale) {
                updateComputed()
            }
            return originalDescriptor.get!.call(this)
        },
        set: originalDescriptor.set
    })

    // Create a special computed effect that immediately marks as stale
    const computedEffect = () => {
        const newValue = fn()
        const currentValue = computedSign.peek()

        if (newValue !== currentValue) {
            isStale = true
            // Always update the computed signal to notify subscribers
            // The subscribers (effects) will handle batching themselves
            updateComputed()
        }
    }

    // This effect should NOT be batched - it needs to run immediately to mark the computed as stale
    const isActive = true

    const dependencyEffect = () => {
        if (!isActive) return

        // This effect should NEVER be batched - it needs to run immediately
        // to mark computed signals as stale when their dependencies change

        if (_effectStack.length > _globalMaxDepth) {
            throw CycleError
        }
        _effectStack.push(dependencyEffect)
        try {
            fn() // This subscribes to dependencies
            computedEffect() // This handles the update logic - runs immediately
        } finally {
            _effectStack.pop()
        }
    }

    dependencyEffect()

    return computedSign
}

export function batch<T> (fn: () => T): T {
    _batchDepth++

    try {
        const result = fn()

        // If this is the outermost batch, flush all batched effects
        if (_batchDepth === 1) {
            const effects = [..._batchedEffects]
            _batchedEffects = []

            // Execute all batched effects
            effects.forEach(effectFn => {
                if (effectFn._execute) {
                    effectFn._execute()
                } else {
                    effectFn()
                }
            })
        }

        return result
    } finally {
        _batchDepth--
    }
}
