import { useEffect, useState } from 'react'
import { formatPrice, resolveLocalizedValue } from '../../utils/index'
import AttributeSelector from './AttributeSelector'
import './PriceSidebar.css'

export default function PriceSidebar({
  variant,
  specs,
  colors,
  selectedColor,
  onColorChange,
  attributes,
  selectedAttributes,
  onAttributeChange,
  language,
  t,
  priceUnit,
}) {
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
          {(() => {
            const isNumeric = variant?.unit_type === 'numeric';
            const isContact = variant?.unit_type === 'contact';
            const isInfinite = variant?.unit_type === 'infinite';
            
            // For numeric, max allowed is current unit count, for infinite/contact it's unlimited (e.g. 99)
            const maxQuantity = isNumeric ? (variant?.unit || 0) : 99;
            const [quantity, setQuantity] = useState(1);

            // Automatically reset or limit quantity if variant changes and current state exceeds max
            useEffect(() => {
              if (quantity > maxQuantity) {
                setQuantity(maxQuantity > 0 ? 1 : 0);
              } else if (quantity === 0 && maxQuantity > 0) {
                setQuantity(1);
              }
            }, [variant, maxQuantity]);

            const handleIncrement = () => {
              if (quantity < maxQuantity) {
                setQuantity(prev => prev + 1);
              }
            };

            const handleDecrement = () => {
              if (quantity > 1) {
                setQuantity(prev => prev - 1);
              }
            };

            return (
              <div className="variant-unit-container">
                <div
                  onClick={() => alert(`Variant ID: ${variant?.id}`)}
                  className="variant-unit-btn"
                >
                  <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      className="qty-btn" 
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button 
                      type="button"
                      className="qty-btn" 
                      onClick={handleIncrement}
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                {isContact && (
                  <p className="variant-unit-help">
                    {t('productDetails.preOrderNote')}
                  </p>
                )}

                {isNumeric && (
                  <p className="variant-unit-help">
                    {variant?.unit > 0 
                      ? t('productDetails.inStockLabel').replace('{count}', variant?.unit)
                      : t('productDetails.outOfStockLabel')}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  )
}

