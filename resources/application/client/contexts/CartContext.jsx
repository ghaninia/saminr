import { createContext, useContext, useState, useEffect } from 'react'
import { CartService } from '../services/cart.service'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  // Fetch initial cart and sub/unsub to cart service events
  useEffect(() => {
    const updateLocalState = () => {
      const items = CartService.getCart()
      const totals = CartService.getTotals()
      
      setCartItems(items)
      setTotalItems(totals.totalItems)
      setTotalPrice(totals.totalPrice)
    }

    // Load initial values
    updateLocalState()

    // Subscribe to cart events for reactive updates from any file/service
    const unsubscribe = CartService.subscribe(updateLocalState)
    return () => unsubscribe()
  }, [])

  const addToCart = (itemParams) => {
    return CartService.addToCart(itemParams)
  }

  const updateQuantity = (productId, variantId, quantity) => {
    return CartService.updateQuantity(productId, variantId, quantity)
  }

  const removeFromCart = (productId, variantId) => {
    return CartService.removeFromCart(productId, variantId)
  }

  const clearCart = () => {
    CartService.clearCart()
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
