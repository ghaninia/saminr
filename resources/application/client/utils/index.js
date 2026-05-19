/**
 * Utility functions for data manipulation and formatting
 */

import { REGEX, DEFAULTS, LOCALES } from '../constants/index'

/**
 * Resolves localized text from various formats
 * @param {string|Object|null} value - The value to resolve
 * @param {string} locale - The locale code (fa/en)
 * @returns {string} The resolved text
 */
export function resolveLocalizedText(value, locale) {
  if (!value) return ''

  if (typeof value === 'string') return value

  if (typeof value === 'object' && !Array.isArray(value)) {
    return String(value?.[locale] ?? value?.fa ?? value?.en ?? '')
  }

  return ''
}

/**
 * Resolves localized value with fallback support
 * @param {any} value - The base value
 * @param {any} valueI18n - The localized variant
 * @param {string} locale - The locale code
 * @returns {string} The resolved value as string
 */
export function resolveLocalizedValue(value, valueI18n, locale) {
  if (valueI18n && typeof valueI18n === 'object' && !Array.isArray(valueI18n)) {
    return String(valueI18n?.[locale] ?? valueI18n?.fa ?? valueI18n?.en ?? value ?? '')
  }

  return String(value ?? '')
}

/**
 * Formats a price for display based on locale
 * @param {number|string} price - The price to format
 * @param {string} language - The language code (fa/en)
 * @returns {string} The formatted price
 */
export function formatPrice(price, language) {
  if (!Number.isFinite(Number(price))) {
    return DEFAULTS.PRICE_DISPLAY
  }

  try {
    const locale = language === LOCALES.FA ? 'fa-IR' : 'en-US'
    return new Intl.NumberFormat(locale).format(Number(price))
  } catch {
    return String(price)
  }
}

/**
 * Sanitizes SVG strings to ensure they start with <svg
 * @param {string} svg - The SVG string to sanitize
 * @returns {string} The sanitized SVG or empty string
 */
export function sanitizeSvg(svg) {
  if (typeof svg !== 'string') return ''

  const trimmed = svg.trim()
  return REGEX.SVG_START.test(trimmed) ? trimmed : ''
}

/**
 * Normalizes array responses from API
 * @param {any} payload - The API response
 * @returns {Array} Normalized array
 */
export function normalizeArrayResponse(payload) {
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}

/**
 * Normalizes object responses from API
 * @param {any} payload - The API response
 * @returns {Object|null} Normalized object
 */
export function normalizeObjectResponse(payload) {
  return payload?.data ?? payload ?? null
}

/**
 * Determines if an object is localized (has fa/en properties)
 * @param {any} value - The value to check
 * @returns {boolean} True if value is a localized object
 */
export function isLocalizedObject(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (Object.prototype.hasOwnProperty.call(value, 'fa') ||
        Object.prototype.hasOwnProperty.call(value, 'en'))
  )
}

/**
 * Recursively resolves localized values in nested structures
 * @param {any} value - The value to resolve
 * @param {string} locale - The locale code
 * @returns {any} The resolved value
 */
export function resolveLocalizedNested(value, locale) {
  if (Array.isArray(value)) {
    return value.map((item) => resolveLocalizedNested(item, locale))
  }

  if (isLocalizedObject(value)) {
    return value[locale] ?? value.fa ?? value.en ?? null
  }

  return value
}

/**
 * Gets a value from nested object using dot notation path
 * @param {Object} source - The source object
 * @param {string} path - The path to navigate (e.g., 'user.name')
 * @returns {any} The value at the path or undefined
 */
export function getValueByPath(source, path) {
  if (!path) return source

  return path.split('.').reduce((value, segment) => value?.[segment], source)
}

/**
 * Clamps an index within array bounds with wrapping
 * @param {number} index - The index to clamp
 * @param {number} length - The array length
 * @returns {number} The clamped index
 */
export function clampIndex(index, length) {
  if (length <= 0) return 0
  if (index < 0) return length - 1
  if (index >= length) return 0
  return index
}

/**
 * Gets the appropriate direction based on language
 * @param {string} language - The language code
 * @returns {string} 'rtl' or 'ltr'
 */
export function getDirection(language) {
  return language === LOCALES.FA ? DEFAULTS.DIR.FA : DEFAULTS.DIR.EN
}

/**
 * Safely parse JSON with fallback
 * @param {string} jsonString - The JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed object or fallback
 */
export function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

/**
 * Safely stringify to JSON with fallback
 * @param {any} value - The value to stringify
 * @param {string} fallback - Fallback string if stringifying fails
 * @returns {string} JSON string or fallback
 */
export function safeJsonStringify(value, fallback = '') {
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

/**
 * Encodes URI component safely
 * @param {string} str - The string to encode
 * @returns {string} The encoded string
 */
export function safeEncodeURIComponent(str) {
  try {
    return encodeURIComponent(String(str))
  } catch {
    return String(str)
  }
}

/**
 * Removes whitespace for formatting (e.g., phone numbers)
 * @param {string} str - The string to process
 * @returns {string} String without whitespace
 */
export function removeWhitespace(str) {
  return String(str).replace(REGEX.WHITESPACE, '')
}
