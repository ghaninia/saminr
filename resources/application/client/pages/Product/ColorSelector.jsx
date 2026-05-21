import { resolveLocalizedValue } from '../../utils/index'

export default function ColorSelector({ colors, selectedColor, onColorChange, language, t }) {
  if (!colors || colors.length === 0) {
    return null
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-white">{t('productDetails.colors')}</p>
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
                  : 'border-white/30'
              }`}
              title={label}
              aria-label={label}
              style={{ backgroundColor: colorItem.swatch || '#E5E7EB' }}
            />
          )
        })}
      </div>
    </div>
  )
}
