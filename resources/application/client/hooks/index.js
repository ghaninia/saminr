/**
 * Custom React hooks for common patterns
 */

import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Hook for managing async data fetching with proper cleanup
 * @param {Function} fetchFn - Async function that returns data
 * @param {Array} dependencies - Dependency array
 * @param {any} initialValue - Initial value for data state
 * @returns {{data: any, loading: boolean, error: string|null, refetch: Function}}
 */
export function useAsyncData(fetchFn, dependencies = [], initialValue = null) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(dependencies.length > 0)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let isMounted = true
      const result = await fetchFn()

      if (!isMounted) return

      setData(result)
    } catch (err) {
      if (!isMounted) return

      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      if (!isMounted) return
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [fetchFn])

  useEffect(() => {
    let isMounted = true

    const execute = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchFn()

        if (!isMounted) return

        setData(result)
      } catch (err) {
        if (!isMounted) return

        const message = err instanceof Error ? err.message : 'An error occurred'
        setError(message)
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    if (dependencies.length > 0) {
      execute()
    }

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error, refetch }
}

/**
 * Hook for managing boolean toggle state
 * @param {boolean} initialValue - Initial state value
 * @returns {[boolean, Function, Function, Function]} - [state, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return [value, toggle, setTrue, setFalse]
}

/**
 * Hook for storing value in localStorage with state management
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function]} - [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * Hook for debouncing a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for previous value comparison
 * @param {any} value - Current value
 * @returns {any} Previous value
 */
export function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * Hook for tracking component mount status
 * @returns {boolean} True if component is mounted
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

/**
 * Hook for handling window resize
 * @returns {Object} Window dimensions {width, height}
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * Hook for tracking when element is visible in viewport
 * @param {React.RefObject} ref - Reference to the element
 * @param {Object} options - IntersectionObserver options
 * @returns {boolean} True if element is visible
 */
export function useIntersectionObserver(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, {
      threshold: 0.1,
      ...options,
    })

    observer.observe(ref.current)

    return () => {
      observer.unobserve(ref.current)
    }
  }, [ref, options])

  return isVisible
}
