import { useLanguage } from '../../contexts/LanguageContext'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, resolveLocalizedValue, resolveLocalizedText } from '../../utils/index'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/index'
import './Cart.css'

export default function Cart() {
  const { t, language } = useLanguage()
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart()
  const priceUnit = t('products.currencyUnit') || 'تومان'

  const direction = language === 'fa' ? 'rtl' : 'ltr'

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-wrapper" style={{ direction }}>
        <div className="container mx-auto px-4">
          <div className="cart-empty-state">
            <h2 className="cart-title">{t('cart.title')}</h2>
            <p className="cart-empty-text">{t('cart.empty')}</p>
            <Link to={ROUTES.HOME} className="btn-primary">
              {t('cart.backToStore')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page-wrapper" style={{ direction }}>
      <div className="container mx-auto px-4">
        <h2 className="cart-title">{t('cart.title')}</h2>
        
        <div className="cart-grid">
          {/* Items column */}
          <div className="cart-items-section space-y-4">
            {cartItems.map((item) => {
              const maxQty = item.selectedVariant?.unit_type === 'numeric' ? (item.selectedVariant?.unit || 0) : 99
              const subtotal = item.price * item.quantity

              // Localize product title if product raw is saved
              const localizedTitle = item.product?.title_i18n
                ? resolveLocalizedText(item.product.title_i18n, language)
                : item.productTitle

              // Find and localize attribute keys/values using saved rawAttributes
              const localizedAttributes = []

              // Localized color info if any
              if (item.selectedVariant?.color) {
                // Try to find the localized color name from option
                let colorName = item.selectedVariant.color
                if (item.product?.colors) {
                  const matchingColor = item.product.colors.find(c => c.color_code === item.selectedVariant.color)
                  if (matchingColor && matchingColor.color_i18n) {
                    colorName = resolveLocalizedText(matchingColor.color_i18n, language)
                  }
                }
                localizedAttributes.push({
                  label: t('productDetails.colors'),
                  value: colorName
                })
              }

              // Localized dynamic attributes if any
              if (item.variantAttributes && item.rawAttributes) {
                Object.entries(item.variantAttributes).forEach(([key, valId]) => {
                  // Find the matching attribute in rawAttributes
                  const matchingAttr = item.rawAttributes.find(
                    attr => attr.key === key || attr.id?.toString() === key
                  )
                  if (matchingAttr) {
                    const attrLabel = resolveLocalizedValue(matchingAttr.label, matchingAttr.label_i18n, language)
                    
                    // Match values to translate them correctly
                    const valIdx = matchingAttr.values?.indexOf(valId)
                    let attrVal = valId
                    if (valIdx !== undefined && valIdx !== -1 && matchingAttr.values_i18n && matchingAttr.values_i18n[valIdx]) {
                      attrVal = resolveLocalizedValue(valId, matchingAttr.values_i18n[valIdx], language)
                    }
                    
                    localizedAttributes.push({
                      label: attrLabel,
                      value: attrVal
                    })
                  } else {
                    localizedAttributes.push({
                      label: key,
                      value: valId
                    })
                  }
                })
              } else if (item.variantAttributes) {
                Object.entries(item.variantAttributes).forEach(([key, val]) => {
                  localizedAttributes.push({
                    label: key,
                    value: val
                  })
                })
              }

              return (
                <div key={`${item.productId}-${item.selectedVariant.id}`} className="cart-item-row">
                  {/* Image */}
                  <img src={item.image} alt={localizedTitle} className="cart-item-img" />
                  
                  {/* Title & Attributes */}
                  <div className="cart-item-details">
                    <Link to={`/products/${item.slug}`} className="cart-item-title">
                      {localizedTitle}
                    </Link>
                    
                    {/* Selected Attributes info */}
                    <div className="cart-item-attributes">
                      {localizedAttributes.map((attr, idx) => (
                        <span key={idx} className="cart-attr-badge">
                          {attr.label}: {attr.value}
                        </span>
                      ))}
                    </div>

                    <button 
                      className="cart-item-remove mt-2 self-start"
                      onClick={() => removeFromCart(item.productId, item.selectedVariant.id)}
                    >
                      {t('cart.remove')}
                    </button>
                  </div>

                  {/* Price */}
                  <div className="cart-item-price hidden sm:block">
                    {formatPrice(item.price, language)} {priceUnit}
                  </div>

                  {/* Quantity Controls */}
                  <div className="cart-item-quantity">
                    <button 
                      className="qty-control-btn"
                      onClick={() => updateQuantity(item.productId, item.selectedVariant.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button 
                      className="qty-control-btn"
                      onClick={() => updateQuantity(item.productId, item.selectedVariant.id, item.quantity + 1)}
                      disabled={item.quantity >= maxQty}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="cart-item-total">
                    {formatPrice(subtotal, language)} {priceUnit}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Checkout & Summary column */}
          <div className="cart-summary-section h-fit">
            <h3 className="text-xl font-bold mb-6">{t('cart.summary')}</h3>
            
            <div className="summary-row">
              <span className="text-slate-400">{t('cart.totalItems')}</span>
              <span className="font-semibold">{formatPrice(totalItems, language)}</span>
            </div>

            <div className="summary-row total">
              <span>{t('cart.totalPrice')}</span>
              <span>{formatPrice(totalPrice, language)} {priceUnit}</span>
            </div>

            <button className="btn-primary btn-checkout">
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export { Cart }
