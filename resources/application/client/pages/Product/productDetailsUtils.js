import {
  resolveLocalizedText,
  resolveLocalizedValue,
  sanitizeSvg,
} from '../../utils/index'
import { ASSETS, LOCALES } from '../../constants/index'

/**
 * Normalizes and enriches product data for display
 * @param {Object} product - Raw product data from API
 * @param {string} language - Current language/locale
 * @param {Function} translate - Translation function t()
 * @returns {Object} Normalized product object
 */
export function normalizeProduct(product, language, translate) {
  if (!product) return null

  const title = resolveLocalizedText(product.title, language)
  const subtitle = resolveLocalizedText(product.subtitle, language)
  const description = resolveLocalizedText(product.description, language)
  
  const image =
    typeof product.image === 'string' && product.image.trim()
      ? product.image
      : ASSETS.IMAGES.NOT_FOUND

  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((item) => typeof item === 'string' && item.trim())
    : []

  const introVideo =
    typeof product.intro_video === 'string' && product.intro_video.trim()
      ? product.intro_video
      : ''

  const variants = Array.isArray(product.variants) ? product.variants : []
  const colors = Array.isArray(product.colors) ? product.colors : []
  const attributes = getAvailableAttributesFromVariants(variants)

  const defaultVariant =
    product.default_variant ??
    variants.find((v) => v?.is_default) ??
    variants[0] ??
    null

  return {
    ...product,
    title,
    subtitle,
    description,
    image,
    gallery,
    introVideo,
    variants,
    colors,
    attributes,
    defaultVariant,
  }
}

/**
 * Dynamically extracts unique attributes (excluding color) from variants
 * @param {Array} variants 
 * @returns {Array} List of formatted attributes
 */
export function getAvailableAttributesFromVariants(variants) {
  if (!Array.isArray(variants)) return []

  const attributesMap = {}

  variants.forEach((variant) => {
    if (!Array.isArray(variant.attributes)) return

    variant.attributes.forEach((attr) => {
      // Check both is_color and isColor (camelCase/snake_case check for safety)
      const isColor = attr.is_color || attr.isColor
      if (isColor) return

      if (!attributesMap[attr.key]) {
        attributesMap[attr.key] = {
          key: attr.key,
          label: attr.label,
          icon_svg: attr.icon_svg || attr.iconSvg,
          values: [],
          values_i18n: [],
        }
      }

      const attrGroup = attributesMap[attr.key]
      if (!attrGroup.values.includes(attr.value)) {
        attrGroup.values.push(attr.value)
        attrGroup.values_i18n.push(attr.value_i18n || attr.valueI18n || attr.value)
      }
    })
  })

  return Object.values(attributesMap)
}

/**
 * Gets gallery images including intro video if present
 * @param {Object} normalized - Normalized product
 * @param {Function} translate - Translation function t()
 * @returns {Array} Array of gallery items
 */
export function getGalleryImages(normalized, translate) {
  if (!normalized) return []

  const items = normalized.gallery.map((url, index) => ({
    type: 'image',
    url,
    label: `${normalized.title || translate('productDetails.mediaProductFallback')} ${index + 1}`,
  }))
  
  return items
}

/**
 * Gets image-only items from gallery for lightbox
 * @param {Array} galleryImages - Full gallery with videos
 * @returns {Array} Images only
 */
export function getImageMediaItems(galleryImages) {
  return galleryImages.filter((item) => item.type === 'image' && item.url)
}

/**
 * Gets variants filtered by selected color
 * @param {Object} normalized - Normalized product
 * @param {string} selectedColor - Selected color name
 * @returns {Array} Filtered variants
 */
export function getVisibleVariants(normalized, selectedColor) {
  if (!normalized || !Array.isArray(normalized.variants)) return []
  if (!selectedColor) return normalized.variants
  return normalized.variants.filter((v) => (v?.color ?? null) === selectedColor)
}

/**
 * Gets the active variant based on visibility and default status
 * @param {Array} visibleVariants - Variants visible for selected color
 * @param {Object} normalized - Normalized product
 * @returns {Object|null} Active variant
 */
export function getActiveVariant(visibleVariants, normalized) {
  if (!Array.isArray(visibleVariants) || visibleVariants.length === 0) {
    return normalized?.defaultVariant ?? null
  }

  return visibleVariants.find((v) => v?.is_default) ?? visibleVariants[0] ?? null
}

/**
 * Gets initial selected color for product
 * @param {Object} normalized - Normalized product
 * @returns {string|null} Color name to select initially
 */
export function getInitialColor(normalized) {
  if (!normalized) return null
  return (
    normalized.defaultVariant?.color ??
    normalized.colors[0]?.name ??
    null
  )
}

/**
 * Processes attribute specs for display
 * @param {Array} attributes - Raw attributes array
 * @param {string} language - Current language
 * @returns {Array} Processed specs
 */
export function processAttributeSpecs(attributes, language) {
  if (!Array.isArray(attributes)) return []

  return attributes
    .map((attr, index) => {
      const label = resolveLocalizedValue(
        attr?.label,
        attr?.label_i18n,
        language
      )

      const localizedValues = Array.isArray(attr?.values_i18n)
        ? attr.values_i18n
            .map((entry) => {
              if (typeof entry === 'string') return entry
              if (entry && typeof entry === 'object') {
                return entry?.[language] ?? entry?.fa ?? entry?.en ?? ''
              }
              return ''
            })
            .filter(Boolean)
        : []

      const rawValues = Array.isArray(attr?.values)
        ? attr.values.map((e) => String(e ?? '')).filter(Boolean)
        : []

      const fallbackValue = resolveLocalizedValue(
        attr?.default_value,
        attr?.default_value_i18n,
        language
      )

      const value = localizedValues.join('، ') || rawValues.join('، ') || fallbackValue

      return {
        key: String(attr?.key ?? index),
        label,
        value,
        iconSvg: sanitizeSvg(attr?.icon_svg),
      }
    })
    .filter((item) => item.label && item.value)
}

/**
 * Gets specs to render - variant specs or fallback to summary specs
 * @param {Object} activeVariant - Currently active variant
 * @param {Object} normalized - Normalized product
 * @param {string} language - Current language
 * @returns {Object} { specs, source } - Specs and whether from variant or summary
 */
export function getRenderedSpecs(activeVariant, normalized, language) {
  if (!normalized) {
    return { specs: [], source: 'none' }
  }

  const variantSpecs = activeVariant
    ? processAttributeSpecs(
        (activeVariant.attributes ?? []).filter((a) => a?.is_color !== true),
        language
      )
    : []

  if (variantSpecs.length > 0) {
    return { specs: variantSpecs, source: 'variant' }
  }

  const summarySpecs = processAttributeSpecs(
    normalized.summaryAttributes,
    language
  )

  return { specs: summarySpecs, source: 'summary' }
}

/**
 * Gets text direction based on language
 * @param {string} language - Language code
 * @returns {string} 'rtl' or 'ltr'
 */
export function getTextDirection(language) {
  return language === LOCALES.FA ? 'rtl' : 'ltr'
}
