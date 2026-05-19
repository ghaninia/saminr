import { createContext, useContext, useEffect, useState } from 'react'
import { useLanguage } from './LanguageContext'
import { apiClient } from '../services/apiClient'
import { STORAGE_KEYS, CACHE_TTL } from '../constants/index'
import {
  getValueByPath,
  resolveLocalizedNested,
  isLocalizedObject,
  safeJsonParse,
  safeJsonStringify,
} from '../utils/index'

const SettingsContext = createContext()

let settingsRequestPromise = null

/**
 * Clears stored settings from localStorage
 */
function clearStoredSettings() {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS_CACHE)
}

/**
 * Reads settings from localStorage with TTL validation
 * @returns {Object|null} Cached settings or null if expired/invalid
 */
function readSettingsFromStorage() {
  const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS_CACHE)

  if (!rawSettings) {
    return null
  }

  const parsedSettings = safeJsonParse(rawSettings)

  if (!parsedSettings || typeof parsedSettings !== 'object') {
    clearStoredSettings()
    return null
  }

  if (typeof parsedSettings.expiresAt !== 'number' || Date.now() >= parsedSettings.expiresAt) {
    clearStoredSettings()
    return null
  }

  return parsedSettings.data && typeof parsedSettings.data === 'object'
    ? parsedSettings.data
    : null
}

/**
 * Writes settings to localStorage with TTL
 * @param {Object} settings - The settings to cache
 */
function writeSettingsToStorage(settings) {
  const cacheData = {
    data: settings,
    expiresAt: Date.now() + CACHE_TTL.SETTINGS,
  }
  const jsonString = safeJsonStringify(cacheData)
  localStorage.setItem(STORAGE_KEYS.SETTINGS_CACHE, jsonString)
}

/**
 * Normalizes API response to settings object
 * @param {any} payload - API response
 * @returns {Object} Normalized settings
 */
function normalizeSettingsResponse(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data

  if (!Array.isArray(items)) {
    return {}
  }

  return items.reduce((accumulator, item) => {
    if (!item?.key) {
      return accumulator
    }

    accumulator[item.key] = item.value ?? item.default ?? null
    return accumulator
  }, {})
}

/**
 * Fetches settings from API with request deduplication
 * @returns {Promise<Object>} Settings data
 */
async function fetchSettingsFromApi() {
  if (!settingsRequestPromise) {
    settingsRequestPromise = apiClient
      .getClientSettings()
      .then((payload) => {
        const normalizedSettings = normalizeSettingsResponse(payload)
        writeSettingsToStorage(normalizedSettings)
        return normalizedSettings
      })
      .finally(() => {
        settingsRequestPromise = null
      })
  }

  return settingsRequestPromise
}

/**
 * Gets initial state from cache or defaults
 * @returns {Object} Initial state
 */
function getInitialState() {
  const cachedSettings = readSettingsFromStorage()

  return {
    settings: cachedSettings ?? {},
    isLoading: cachedSettings === null,
    error: null,
    shouldLoadFromApi: cachedSettings === null,
  }
}

export function SettingsProvider({ children }) {
  const { language } = useLanguage()
  const [state, setState] = useState(getInitialState)

  useEffect(() => {
    if (!state.shouldLoadFromApi) {
      return
    }

    let isMounted = true

    fetchSettingsFromApi()
      .then((nextSettings) => {
        if (!isMounted) {
          return
        }

        setState({
          settings: nextSettings,
          isLoading: false,
          error: null,
          shouldLoadFromApi: false,
        })
      })
      .catch((error) => {
        if (!isMounted) {
          return
        }

        setState((currentState) => ({
          ...currentState,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load settings',
          shouldLoadFromApi: false,
        }))
      })

    return () => {
      isMounted = false
    }
  }, [state.shouldLoadFromApi])

  const refreshSettings = async () => {
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }))

    try {
      const nextSettings = await fetchSettingsFromApi()
      setState({
        settings: nextSettings,
        isLoading: false,
        error: null,
        shouldLoadFromApi: false,
      })

      return nextSettings
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings'

      setState((currentState) => ({
        ...currentState,
        isLoading: false,
        error: message,
        shouldLoadFromApi: false,
      }))

      throw error
    }
  }

  const getSetting = (key, options = {}) => {
    const { fallback = null, localized = true, locale = language } = options
    const value = getValueByPath(state.settings, key)

    if (value === undefined) {
      return fallback
    }

    if (!localized) {
      return value
    }

    const resolvedValue = resolveLocalizedNested(value, locale)
    return resolvedValue ?? fallback
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: state.settings,
        settingsError: state.error,
        settingsLoading: state.isLoading,
        refreshSettings,
        getSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }

  return context
}
