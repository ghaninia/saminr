import { formatPrice, resolveLocalizedValue } from '../../utils/index'
import { useCart } from '../../contexts/CartContext'
import AttributeSelector from './AttributeSelector'
import './PriceSidebar.css'

export default function PriceSidebar({
  productId,
  productTitle,
  slug,
  image,
  variant,
  specs,
  colors,
  selectedColor,
  onColorChange,
  attributes,
  selectedAttributes,
  onAttributeChange,
  quantity,
  onQuantityChange,
  language,
  t,
  priceUnit,
  productRaw, // Full raw normalized product
}) {
  const { addToCart } = useCart()

  if (!variant) {
    return (
      <div className="car-details">
        <div className="sidebar-car">
          <div className="title">
            <h4>--</h4>
          </div>
          <div className="item">
            <p className="text-slate-400">{t('productDetails.noPrice')}</p>
          </div>
        </div>
      </div>
    )
  }

  const isNumeric = variant?.unit_type === 'numeric';
  const isContact = variant?.unit_type === 'contact';
  const isInfinite = variant?.unit_type === 'infinite';
  
  // For numeric, max allowed is current unit count, for infinite/contact it's unlimited (e.g. 99)
  const maxQuantity = isNumeric ? (variant?.unit || 0) : 99;

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      product: productRaw,
      productId,
      slug,
      selectedVariant: variant,
      quantity,
      price: variant.price,
    })
    // Reset quantity back to 1
    onQuantityChange(1)
  }

  return (
    <div className="car-details">
      <div className="sidebar-car">
        {/* Price Section */}
        <div className="title">
          <h4>
            {formatPrice(variant.price, language)}
            <span className="product-price-unit">
              {priceUnit}
            </span>
          </h4>
        </div>

        {/* Features Section */}
        <div className="item">
          {/* Color Selector Section */}
          {colors && colors.length > 0 && (
            <div className="colors">
              <div className="color__title">
                {t('productDetails.colors')}
              </div>
              <ul className="color__items">
                {colors.map((colorItem) => {
                  const isSelected = selectedColor === colorItem.name
                  const label = resolveLocalizedValue(
                    colorItem.name,
                    colorItem.name_i18n,
                    language
                  )
                  return (
                    <li
                      key={`color-${colorItem.name}`}
                      onClick={() => onColorChange(colorItem.name)}
                      data-color={colorItem.swatch}
                      className={isSelected ? 'selected' : ''}
                    >
                      <span className="color__swatch" style={{ backgroundColor: colorItem.swatch }}></span>
                      <span>{label}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Dynamic Attributes Selector */}
          {attributes && attributes.map((attr) => (
            <AttributeSelector
              key={attr.key}
              attribute={attr}
              selectedValue={selectedAttributes[attr.key]}
              onChange={(value) => onAttributeChange(attr.key, value)}
              language={language}
            />
          ))}

          {/* Unit Type & Quantity Controls */}
          <div className="variant-unit-container">
            {/* Click container alerts active Variant ID */}
            <div
              className="variant-unit-btn"
              style={{ cursor: 'pointer', opacity: 1 }}
            >
              <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  className="qty-btn" 
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || (isNumeric && variant?.unit === 0)}
                >
                  -
                </button>
                <span className="qty-value">{(isNumeric && variant?.unit === 0) ? 0 : quantity}</span>
                <button 
                  type="button"
                  className="qty-btn" 
                  onClick={handleIncrement}
                  disabled={quantity >= maxQuantity || (isNumeric && variant?.unit === 0)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Premium CTA Button */}
            <button
              type="submit"
              onClick={handleAddToCart}
              className="button-1 add-to-cart-btn"
              disabled={isNumeric && variant?.unit === 0}
            >
              {t('productDetails.addToCart')}
            </button>

            {isContact && (
              <p className="variant-unit-help pre-order-text">
                {t('productDetails.preOrderNote')}
              </p>
            )}

            {isNumeric && (
              <p className="variant-unit-help stock-text">
                {variant?.unit > 0 
                  ? t('productDetails.inStockLabel').replace('{count}', variant?.unit)
                  : t('productDetails.outOfStockLabel')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

