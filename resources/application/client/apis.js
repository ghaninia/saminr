/**
 * Backward compatibility wrapper
 * Re-exports from centralized API service
 */

import { apiClient } from './services/apiClient'
import { API_ENDPOINTS } from './constants/index'

export const apiEndpoints = {
  client: {
    settings: API_ENDPOINTS.CLIENT.SETTINGS,
    categories: API_ENDPOINTS.CLIENT.CATEGORIES,
    products: API_ENDPOINTS.CLIENT.PRODUCTS,
    reviews: API_ENDPOINTS.CLIENT.REVIEWS,
    subscribe: API_ENDPOINTS.CLIENT.SUBSCRIBE,
  },
}

export { apiClient }
