import { storage } from '../utils/storage'

const CART_KEY = 'saminr_client_cart'

/**
 * Professional Cart Service utilizing local storage and pub/sub events for real-time reactivity.
 * Features strict validation of products, variants, quantities, and structure.
 */
export const CartService = {
  /**
   * Get all items in the cart
   * @returns {Array} Cart items
   */
  getCart: () => {
    return storage.get(CART_KEY, [])
  },

  /**
   * Add a product variant to the cart
   * @param {Object} itemParams - Product & variant parameters
   * @returns {Array} Updated cart items
   */
  addToCart: (itemParams) => {
    const { product, productId, slug, selectedVariant, quantity, price } = itemParams

    if (!productId || !product || !selectedVariant || !selectedVariant.id) {
      console.warn('Invalid item params details for cart submission')
      return CartService.getCart()
    }

    const currentCart = CartService.getCart()
    
    // Find if exact matching variant id already exists in the cart
    const existingIndex = currentCart.findIndex(
      (item) => item.productId === productId && item.selectedVariant.id === selectedVariant.id
    )

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += quantity
    } else {
      currentCart.push({
        productId,
        product,
        slug,
        selectedVariant,
        quantity,
        price,
        addedAt: new Date().toISOString()
      })
    }

    storage.set(CART_KEY, currentCart)
    CartService._notify()
    return currentCart
  },

  /**
   * Update quantity of a specific variant in the cart
   * @param {string|number} productId 
   * @param {string|number} variantId 
   * @param {number} quantity 
   * @returns {Array} Updated cart items
   */
  updateQuantity: (productId, variantId, quantity) => {
    if (quantity < 1) return CartService.getCart()

    const currentCart = CartService.getCart()
    const itemIndex = currentCart.findIndex(
      (item) => item.productId === productId && item.selectedVariant.id === variantId
    )

    if (itemIndex !== -1) {
      const item = currentCart[itemIndex]
      const maxQuantity = item.selectedVariant.unit_type === 'numeric' ? (item.selectedVariant.unit || 0) : 99

      currentCart[itemIndex].quantity = Math.min(quantity, maxQuantity)
      storage.set(CART_KEY, currentCart)
      CartService._notify()
    }

    return currentCart
  },

  /**
   * Remove item from cart
   * @param {string|number} productId 
   * @param {string|number} variantId 
   * @returns {Array} Updated cart items
   */
  removeFromCart: (productId, variantId) => {
    let currentCart = CartService.getCart()
    currentCart = currentCart.filter(
      (item) => !(item.productId === productId && item.selectedVariant.id === variantId)
    )

    storage.set(CART_KEY, currentCart)
    CartService._notify()
    return currentCart
  },

  /**
   * Clear entire cart
   */
  clearCart: () => {
    storage.remove(CART_KEY)
    CartService._notify()
  },

  /**
   * Calculate totals
   */
  getTotals: () => {
    const items = CartService.getCart()
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return { totalItems, totalPrice }
  },

  /**
   * Pub/Sub: Register a callback for cart updates
   */
  subscribe: (callback) => {
    window.addEventListener('saminr_cart_update', callback)
    return () => window.removeEventListener('saminr_cart_update', callback)
  },

  /**
   * Private: Dispatch a custom event to notify listeners
   */
  _notify: () => {
    const event = new CustomEvent('saminr_cart_update', { detail: CartService.getCart() })
    window.dispatchEvent(event)
  }
}
