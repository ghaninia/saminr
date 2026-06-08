/**
 * Centralized API service layer
 * Handles all HTTP requests with consistent error handling and response normalization
 */

import { API_ENDPOINTS, HTTP_STATUS } from '../constants/index'

/**
 * Base HTTP request handler with unified error handling
 * @param {string} url - The URL to request
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} The parsed response
 * @throws {Error} If request fails
 */
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
    ...options,
  })

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`

    try {
      const payload = await response.json()
      if (payload?.message) {
        errorMessage = String(payload.message)
      }
    } catch {
      // Ignore parsing errors, use default message
    }

    const error = new Error(errorMessage)
    error.statusCode = response.status
    error.response = response
    throw error
  }

  return response.json()
}

/**
 * HTTP GET request
 * @param {string} url - The URL to request
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} The parsed response
 */
export function httpGet(url, options = {}) {
  return request(url, {
    method: 'GET',
    ...options,
  })
}

/**
 * HTTP POST request
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} The parsed response
 */
export function httpPost(url, data = {}, options = {}) {
  return request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * HTTP PUT request
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} The parsed response
 */
export function httpPut(url, data = {}, options = {}) {
  return request(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * HTTP DELETE request
 * @param {string} url - The URL to request
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} The parsed response
 */
export function httpDelete(url, options = {}) {
  return request(url, {
    method: 'DELETE',
    ...options,
  })
}

/**
 * HTTP PATCH request
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} The parsed response
 */
export function httpPatch(url, data = {}, options = {}) {
  return request(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * API client for client-facing endpoints
 * Provides typed methods for all client operations
 */
export const apiClient = {
  /**
   * Gets client settings
   * @returns {Promise<any>} Settings data
   */
  getClientSettings() {
    return httpGet(API_ENDPOINTS.CLIENT.SETTINGS)
  },

  /**
   * Gets client categories
   * @returns {Promise<any>} Categories data
   */
  getClientCategories() {
    return httpGet(API_ENDPOINTS.CLIENT.CATEGORIES)
  },

  /**
   * Gets all client products, optionally filtered by category slugs
   * @param {Object} [params]
   * @param {string[]} [params.categorySlugs] - Filter by category slugs (comma-joined)
   * @returns {Promise<any>} Products data
   */
  getClientProducts({ categorySlugs } = {}) {
    const hasSlugs = Array.isArray(categorySlugs) && categorySlugs.length > 0
    const url = hasSlugs
      ? `${API_ENDPOINTS.CLIENT.PRODUCTS}?categories=${encodeURIComponent(categorySlugs.join(','))}`
      : API_ENDPOINTS.CLIENT.PRODUCTS
    return httpGet(url)
  },

  /**
   * Gets a specific product by short link
   * @param {string} shortLink - Product short link identifier
   * @returns {Promise<any>} Product data
   */
  getClientProduct(shortLink) {
    const encodedLink = encodeURIComponent(String(shortLink))
    return httpGet(`${API_ENDPOINTS.CLIENT.PRODUCTS}/${encodedLink}`)
  },

  /**
   * Gets client reviews/testimonials
   * @param {Object} params - Query parameters
   * @param {string} params.lang - Language code
   * @returns {Promise<any>} Reviews data
   */
  getClientReviews({ lang } = {}) {
    const query = lang ? `?lang=${encodeURIComponent(String(lang))}` : ''
    return httpGet(`${API_ENDPOINTS.CLIENT.REVIEWS}${query}`)
  },

  /**
   * Subscribes user to newsletter
   * @param {Object} data - Subscription data
   * @param {string} data.fullname - Subscriber name
   * @param {string} data.email - Subscriber email
   * @returns {Promise<any>} Response data
   */
  subscribe({ fullname, email }) {
    return httpPost(API_ENDPOINTS.CLIENT.SUBSCRIBE, {
      fullname: String(fullname).trim(),
      email: String(email).trim(),
    })
  },
}

export default apiClient
