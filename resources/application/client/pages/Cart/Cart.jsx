import { useLanguage } from '../../contexts/LanguageContext'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, resolveLocalizedText } from '../../utils/index'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/index'
import './Cart.css'
import CartEmpty from './CartEmpty'
import {sanitizeSvg} from '../../utils/index'

export default function Cart() {
  const { t, language } = useLanguage()

  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart()
  const priceUnit = t('products.currencyUnit')

  if (cartItems.length === 0) {
    return (
      <>
      <section className="cart-header">
        <div className="v-middle">
          <div className="container">
            <div className="col-md-12">
              <CartEmpty />
              <h1 className="title">{t('cart.title')}</h1>
              <h6  className="desc">{t('cart.empty')}</h6>
              <Link to={ROUTES.HOME} className="button-1 margin-top-20">
                <span>{t('cart.backToStore')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </>
    )
  }
  return (
    <div className="cart-page">
      <div className="container mx-auto px-4">
        <div className="cart-page-header">
          <h6 className="section-subtitle">{t('cart.description')}</h6>
          <h1 className="section-title">{t('cart.title')}</h1>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {cartItems.map((item, key) => {
          const maxQty =
            item.selectedVariant?.unit_type === 'numeric'
              ? item.selectedVariant?.unit || 0
              : 99
          const subtotal = item.price * item.quantity
          const title = item.product?.title_i18n
            ? resolveLocalizedText(item.product.title_i18n, language)
            : item.product?.title

          return (
            <div key={key} className="cart-page-wrapper">
              <div className="cart-box px-15">
                {/* Product Image */}
                <Link to={`/products/${item.slug}`} className="cart-img">
                  <img
                    src={item.product?.image}
                    alt={title}
                    className="img-fluid"
                  />
                </Link>

                {/* Product Content */}
                <div className="cart-content">
                  {/* Title */}
                  <Link to={`/products/${item.slug}`}>
                    <h4>{title}</h4>
                  </Link>

                  {/* Price */}
                  <div className="price">
                      {formatPrice(item.price, language)}
                      <span> {priceUnit}</span>
                  </div>

                  {/* Quantity & Variant Attributes */}
                  <div className="select-size-sec">
                    {/* Quantity control */}
                    <div className="cart-item-quantity opion">
                      <button
                        className="qty-control-btn"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedVariant.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-control-btn"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedVariant.id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= maxQty}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>

                    {/* Variant Attributes */}
                    {item.selectedVariant?.attributes &&
                      Object.entries(item.selectedVariant.attributes).map(([attrKey, value]) => {
                        const localizedValue = resolveLocalizedText(value.value_i18n, language)
                        const localizedKey = resolveLocalizedText(value.label, language)
                        return (
                          <ul key={attrKey} className="options">
                            <li className="option">
                              {sanitizeSvg(value?.icon_svg) ? (<i
                                className="attribute__icon"
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: sanitizeSvg(value.icon_svg) }}
                                />) : null}
                              <span className="option-label">{localizedKey}: </span>
                              <span className="option-value">{localizedValue}</span>
                            </li>
                          </ul>
                        )
                      })}
                  </div>

                  {/* Cart Options */}
                  <div className="cart-options">
                    <div className="cart-option">
                      <a
                        className="remove-link"
                        onClick={() =>
                          removeFromCart(item.productId, item.selectedVariant.id)
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {t('cart.remove')}
                      </a>
                    </div>
                    <div className="cart-option">
                      {formatPrice(subtotal, language)} {priceUnit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { Cart }