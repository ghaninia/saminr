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

          {/* Color Selector Section */}
          {colors && colors.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                {t('productDetails.colors')}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((colorItem) => {
                  const isSelected = selectedColor === colorItem.name
                  const label = resolveLocalizedValue(
                    colorItem.name,
                    colorItem.name_i18n,
                    language
                  )

                  return (
                    <button
                      key={`color-${colorItem.name}`}
                      type="button"
                      onClick={() => onColorChange(colorItem.name)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        isSelected
                          ? 'border-[#f5b754] ring-2 ring-[#f5b754]/30'
                          : 'border-gray-400'
                      }`}
                      title={label}
                      aria-label={label}
                      style={{ backgroundColor: colorItem.swatch || '#E5E7EB' }}
                    >
                      <span className="sr-only">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

