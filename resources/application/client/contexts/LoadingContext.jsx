import { createContext, useContext, useState, useCallback } from 'react'

const LoadingContext = createContext()

/**
 * LoadingProvider - Global loading state management
 * Provides centralized control for splash screen/loading overlay
 */
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const startLoading = useCallback((initialProgress = 0) => {
    setProgress(initialProgress)
    setIsLoading(true)
  }, [])

  const updateProgress = useCallback((newProgress) => {
    setProgress(Math.min(newProgress, 100))
  }, [])

  const finishLoading = useCallback(() => {
    setProgress(100)
    setIsLoading(false)
  }, [])

  const value = {
    isLoading,
    progress,
    startLoading,
    updateProgress,
    finishLoading,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

/**
 * useGlobalLoading hook
 * Use this in any component to control global loading state
 *
 * @returns {Object} { isLoading, progress, startLoading, updateProgress, finishLoading }
 */
export function useGlobalLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useGlobalLoading must be used within LoadingProvider')
  }
  return context
}
