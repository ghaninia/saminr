import { formatPrice, resolveLocalizedValue } from '../../utils/index'

export default function PriceSidebar({
  variant,
  specs,
  colors,
  selectedColor,
  onColorChange,
  language,
  t,
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

          {specs && specs.length > 0 ? (
            <div className="features-container">
              {specs.map((spec) => (
                <div key={spec.key} className="features">
                  <span>
                    {spec.iconSvg && (
                      <i
                        className="spec-icon"
                        dangerouslySetInnerHTML={{ __html: spec.iconSvg }}
                      />
                    )}
                    {!spec.iconSvg && <i className="spec-icon-placeholder">•</i>}
                    {spec.label}
                  </span>
                  <p>{spec.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm mb-30">
              {t('productDetails.noSpecs')}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}

