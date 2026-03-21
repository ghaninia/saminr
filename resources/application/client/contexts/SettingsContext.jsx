import { createContext, useContext, useEffect, useState } from 'react'
import { useLanguage } from './LanguageContext'
import { apiClient } from '../apis'

const SettingsContext = createContext()

const SETTINGS_STORAGE_KEY = 'client_settings_cache'
const SETTINGS_STORAGE_TTL = 24 * 60 * 60 * 1000

let settingsRequestPromise = null

function clearStoredSettings() {
  localStorage.removeItem(SETTINGS_STORAGE_KEY)
}

function readSettingsFromStorage() {
  const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)

  if (!rawSettings) {
    return null
  }

  try {
    const parsedSettings = JSON.parse(rawSettings)

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
  } catch {
    clearStoredSettings()
    return null
  }
}

function writeSettingsToStorage(settings) {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify({
      data: settings,
      expiresAt: Date.now() + SETTINGS_STORAGE_TTL
    })
  )
}

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

function getValueByPath(source, path) {
  if (!path) {
    return source
  }

  return path.split('.').reduce((value, segment) => value?.[segment], source)
}

function isLocalizedObject(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (Object.prototype.hasOwnProperty.call(value, 'fa') ||
        Object.prototype.hasOwnProperty.call(value, 'en'))
  )
}

function resolveLocalizedValue(value, locale) {
  if (Array.isArray(value)) {
    return value.map((item) => resolveLocalizedValue(item, locale))
  }

  if (isLocalizedObject(value)) {
    return value[locale] ?? value.fa ?? value.en ?? null
  }

  return value
}

function getInitialState() {
  const cachedSettings = readSettingsFromStorage()

  return {
    settings: cachedSettings ?? {},
    isLoading: cachedSettings === null,
    error: null,
    shouldLoadFromApi: cachedSettings === null
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
          shouldLoadFromApi: false
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
          shouldLoadFromApi: false
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
      error: null
    }))

    try {
      const nextSettings = await fetchSettingsFromApi()
      setState({
        settings: nextSettings,
        isLoading: false,
        error: null,
        shouldLoadFromApi: false
      })

      return nextSettings
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings'

      setState((currentState) => ({
        ...currentState,
        isLoading: false,
        error: message,
        shouldLoadFromApi: false
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

    const resolvedValue = resolveLocalizedValue(value, locale)
    return resolvedValue ?? fallback
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: state.settings,
        settingsError: state.error,
        settingsLoading: state.isLoading,
        refreshSettings,
        getSetting
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
