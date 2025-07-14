export const CycleError = new Error('Cycle detected')

export type Sign<T> = {
    value: T
}

// Helper function to create signs with injected dependencies
function createSign<T> (
    value: T,
    opts: { maxDepth?: number },
    getSubscriber: () => null | (() => any),
    subscriptions: Set<() => any>
): Sign<T> {
    const MAX_DEPTH = opts.maxDepth || 100
    let _recursion = 0

    return {
        get value (): T {
            const subscriber = getSubscriber()
            if (subscriber) {
                subscriptions.add(subscriber)
            }

            _recursion++
            if (_recursion > MAX_DEPTH) {
                throw CycleError
            }

            return value
        },

        set value (newValue: T) {
            if (newValue === value) return
            value = newValue
            subscriptions.forEach(fn => fn())
        }
    }
}

/**
 * Creates an isolated signal system to avoid concurrency issues.
 * Each call creates its own context with isolated subscriptions.
 *
 * @param value Initial value for the signal
 * @param opts Options including maxDepth for cycle detection
 * @returns Object with isolated sign, effect, and computed functions
 */
export function create<T> (value: T, opts: { maxDepth?: number } = {}) {
    // Each create() call gets its own isolated context
    let _subscriber: null | (() => any) = null
    const _subscriptions = new Set<() => any>()

    const signInstance = createSign(value, opts, () => _subscriber, _subscriptions)

    const effect = (fn: () => any): (() => void) => {
        _subscriber = fn
        fn()
        _subscriber = null
        return _subscriptions.delete.bind(_subscriptions, fn)
    }

    const computed = <U>(fn: () => U): Sign<U> => {
        const derived = createSign<U>(undefined as any, opts, () => _subscriber, _subscriptions)
        effect(() => {
            derived.value = fn()
        })
        return derived
    }

    return {
        sign: signInstance,
        effect,
        computed
    }
}

// Legacy global API (deprecated, but kept for backwards compatibility)
/** @global @deprecated Use create() instead for better isolation */
let _subscriber: null | (() => any) = null
/** @global @deprecated Use create() instead for better isolation */
const _subscriptions = new Set<() => any>()

/**
 * @deprecated Use create() instead to avoid global state issues with async code
 */
export function effect (fn: () => any): () => void {
    _subscriber = fn
    fn()
    _subscriber = null
    return _subscriptions.delete.bind(_subscriptions, fn)
}

/**
 * @deprecated Use create() instead to avoid global state issues with async code
 */
export function computed<T = any> (fn: () => T): { value: T | undefined } {
    const derived = sign<T>()
    effect(() => {
        derived.value = fn()
    })
    return derived
}

/**
 * @deprecated Use create() instead to avoid global state issues with async code
 */
export function sign<T> (value?: T, opts: { maxDepth?: number } = {}): { value: T | undefined } {
    const MAX_DEPTH = opts.maxDepth || 100
    let _recursion = 0

    return {
        get value (): T | undefined {
            if (_subscriber) {
                _subscriptions.add(_subscriber)
            }

            _recursion++
            if (_recursion > MAX_DEPTH) {
                throw CycleError
            }

            return value
        },

        set value (newValue: T | undefined) {
            if (newValue === value) return
            value = newValue
            _subscriptions.forEach(fn => fn())
        }
    }
}
