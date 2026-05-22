import { resolveLocalizedValue } from '../../utils/index'
import {
  sanitizeSvg,
} from '../../utils/index'

export default function AttributeSelector({ attribute, selectedValue, onChange, language }) {
  if (!attribute || !attribute.values || attribute.values.length === 0) {
    return null
  }

  const label = resolveLocalizedValue(
    attribute.label,
    attribute.label, // Fallback if no translation, but attribute.label in our response is an object with {en, fa} or translation maps
    language
  )

  return (
    <div className="attributes">
      <div className="attribute__title">
        {sanitizeSvg(attribute?.icon_svg) ? (
            <i
                className="attribute__icon"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(attribute.icon_svg) }}
                />
            ) : null}
        {label}
      </div>
      <ul className="attribute__items">
        {attribute.values.map((val, idx) => {
          const isSelected = selectedValue === val
          const valI18n = attribute.values_i18n && attribute.values_i18n[idx]
            ? resolveLocalizedValue(val, attribute.values_i18n[idx], language)
            : val

          return (
            <li
              key={`${attribute.key}-${val}`}
              onClick={() => onChange(val)}
              className={isSelected ? "selected": ""}
            >
              <span>{valI18n}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
