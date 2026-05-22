import { formatPrice, resolveLocalizedValue } from '../../utils/index'
import AttributeSelector from './AttributeSelector'

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
            {variant.unit && (
              <span> / {variant.unit}</span>
            )}
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
        </div>
      </div>
    </div>
  )
}

