const CLIENT_SETTINGS_ENDPOINT = '/api/client/settings'
const CLIENT_CATEGORIES_ENDPOINT = '/api/client/categories'
const CLIENT_PRODUCTS_ENDPOINT = '/api/client/products'
const CLIENT_REVIEWS_ENDPOINT = '/api/client/reviews'
const CLIENT_SUBSCRIBE_ENDPOINT = '/api/client/subscribe'

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    },
    credentials: 'same-origin',
    ...options
  })

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`

    try {
      const payload = await response.json()
      if (payload?.message) {
        errorMessage = String(payload.message)
      }
    } catch {
      // ignore parsing errors
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

export const apiEndpoints = {
  client: {
    settings: CLIENT_SETTINGS_ENDPOINT,
    categories: CLIENT_CATEGORIES_ENDPOINT,
    products: CLIENT_PRODUCTS_ENDPOINT,
    reviews: CLIENT_REVIEWS_ENDPOINT,
    subscribe: CLIENT_SUBSCRIBE_ENDPOINT
  }
}

export const apiClient = {
  getClientSettings() {
    return requestJson(apiEndpoints.client.settings)
  },
  getClientCategories() {
    return requestJson(apiEndpoints.client.categories)
  },
  getClientProducts() {
    return requestJson(apiEndpoints.client.products)
  },
  getClientReviews({ lang } = {}) {
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : ''
    return requestJson(`${apiEndpoints.client.reviews}${query}`)
  },
  subscribe({ fullname, email }) {
    return requestJson(apiEndpoints.client.subscribe, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname,
        email
      })
    })
  }
}
