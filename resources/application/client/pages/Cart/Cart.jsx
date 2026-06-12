import { useLanguage } from '../../contexts/LanguageContext'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, resolveLocalizedText } from '../../utils/index'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/index'
import './Cart.css'
import CartEmpty from './CartEmpty'

export default function Cart() {
  const { t, language } = useLanguage()

  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart()
  const priceUnit = t('products.currencyUnit')

  if (cartItems.length === 0) {
    return (
      <>
      <section className="cart-header section-padding">
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
    <>
      <section className="cart-header section-padding">
        <div className="v-middle">
          <div className="container">
            <div className="col-md-12">
              <h1 className="title">{t('cart.title')}</h1>
              <h6 className="desc">{t('cart.description')}</h6>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="cart-page-wrapper">
            {cartItems.map((item) => {
            const maxQty =
              item.selectedVariant?.unit_type === 'numeric'
                ? item.selectedVariant?.unit || 0
                : 99

            const subtotal = item.price * item.quantity

            const title = item.product?.title_i18n
              ? resolveLocalizedText(item.product.title_i18n, language)
              : item.product?.title

            return (
              <div
                key={`${item.productId}-${item.selectedVariant.id}`}
                className="cart-item-row"
              >
                {/* Product Image */}
                <img
                  src={item.product?.image}
                  alt={title}
                  className="cart-item-img"
                />

                {/* Product Info */}
                <div className="cart-item-details">
                  <Link
                    to={`/products/${item.slug}`}
                    className="cart-item-title"
                  >
                    {title}
                  </Link>

                  {/* Variant Attributes */}
                  {item.selectedVariant && item.selectedVariant.attributes &&(
                  <div className="cart-item-attributes">
                      {Object.entries(item.selectedVariant.attributes).map(([key, value]) => {

                      const localizedValue = resolveLocalizedText(value.value_i18n, language)
                      const localizedKey = resolveLocalizedText(value.label, language)

                      return (
                          <span key={key} className="cart-attr-badge">
                              {localizedKey}: {localizedValue}
                          </span>
                      )
                      })}
                  </div>
                  )}

                  <button
                    className="cart-item-remove mt-2 self-start"
                    onClick={() =>
                      removeFromCart(
                        item.productId,
                        item.selectedVariant.id
                      )
                    }
                  >
                    {t('cart.remove')}
                  </button>
                </div>

                {/* Price */}
                <div className="cart-item-price hidden sm:block">
                  {formatPrice(item.price, language)} {priceUnit}
                </div>

                {/* Quantity */}
                <div className="cart-item-quantity">
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
                    -
                  </button>

                  <span className="qty-val">
                    {item.quantity}
                  </span>

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
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="cart-item-total">
                  {formatPrice(subtotal, language)} {priceUnit}
                </div>
              </div>
            )
          })}
          </div>
          </div>
          <aside className="lg:col-span-4">
          
          </aside>
      </div>
    </div>
    </>

  )
}

export { Cart }