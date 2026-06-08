import { useEffect, useMemo, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { apiClient } from '../../apis'
import { ROUTES, LOCALES, ASSETS } from '../../constants/index'
import {
  resolveLocalizedText,
  resolveLocalizedValue,
  formatPrice,
  sanitizeSvg,
  normalizeArrayResponse,
} from '../../utils/index'
import { ArrowUpRight } from 'lucide-react'
import '../Main/sections/components/SectionComponents.css'
import './Categories.css'

const DEFAULT_IMAGE = '/images/file-corrupted.svg'

function normalizeCategoriesResponse(payload) {
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}

function normalizeProductsResponse(payload) {
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}

/** Hex color → rgba string with given alpha (0-1) */
function hexAlpha(hex, alpha) {
  if (!hex) return null
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return `rgba(${r},${g},${b},${alpha})`
}

function Categories() {
  const { t, language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── URL state ──────────────────────────────────────────────────────────────
  const activeSlugs = useMemo(() => {
    const raw = searchParams.get('categories')
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []
  }, [searchParams])

  // ── Categories fetch ───────────────────────────────────────────────────────
  const [rawCategories, setRawCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setCategoriesLoading(true)
    apiClient
      .getClientCategories()
      .then((p) => { if (alive) setRawCategories(normalizeCategoriesResponse(p)) })
      .catch(() => { if (alive) setRawCategories([]) })
      .finally(() => { if (alive) setCategoriesLoading(false) })
    return () => { alive = false }
  }, [])

  const categoriesList = useMemo(() => {
    return normalizeCategoriesResponse(rawCategories)
      .map((cat) => ({
        id: cat?.id,
        slug: cat?.short_link ?? '',
        color: cat?.color ?? null,
        title: resolveLocalizedText(cat?.title, language),
      }))
      .filter((cat) => cat.title && cat.slug)
  }, [rawCategories, language])

  // ── Products fetch (re-runs when activeSlugs changes) ─────────────────────
  const [rawProducts, setRawProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const slugsKey = activeSlugs.join(',')

  useEffect(() => {
    let alive = true
    setProductsLoading(true)
    apiClient
      .getClientProducts({ categorySlugs: activeSlugs })
      .then((p) => { if (alive) setRawProducts(normalizeProductsResponse(p)) })
      .catch(() => { if (alive) setRawProducts([]) })
      .finally(() => { if (alive) setProductsLoading(false) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey])

  const products = useMemo(() => {
    return normalizeArrayResponse(rawProducts)
      .map((product) => {
        const variants = Array.isArray(product?.variants) ? product.variants : []
        const defaultVariant =
          product?.default_variant ??
          variants.find((v) => v?.is_default) ??
          variants[0] ??
          null
        const rawImage = typeof product?.image === 'string' ? product.image.trim() : ''
        return {
          id: product?.id,
          short_link: product?.short_link ?? '',
          title: resolveLocalizedText(product?.title, language),
          subtitle: resolveLocalizedText(product?.subtitle, language),
          image: rawImage || ASSETS.IMAGES.NOT_FOUND,
          isFallbackImage: !rawImage,
          variants,
          colors: Array.isArray(product?.colors) ? product.colors : [],
          summaryAttributes: Array.isArray(product?.summary_attributes) ? product.summary_attributes : [],
          defaultVariant,
        }
      })
      .filter((p) => p.title)
  }, [rawProducts, language])

  const [selectedColorByProduct, setSelectedColorByProduct] = useState({})

  const handleColorClick = useCallback((productId, color) => {
    setSelectedColorByProduct((prev) => ({ ...prev, [productId]: color }))
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleSlug = useCallback((slug) => {
    const next = activeSlugs.includes(slug)
      ? activeSlugs.filter((s) => s !== slug)
      : [...activeSlugs, slug]
    setSearchParams(next.length ? { categories: next.join(',') } : {}, { replace: true })
  }, [activeSlugs, setSearchParams])

  const removeSlug = useCallback((slug) => {
    const next = activeSlugs.filter((s) => s !== slug)
    setSearchParams(next.length ? { categories: next.join(',') } : {}, { replace: true })
  }, [activeSlugs, setSearchParams])

  const dir = language === LOCALES.FA ? 'rtl' : 'ltr'

  return (
    <div className="categories-page" dir={dir}>
      <div className="container mx-auto px-4">
        {/* Page header */}
        <div className="categories-page-header">
          <h6 className="section-subtitle">{t('categories.subtitle')}</h6>
          <h1 className="section-title">{t('categories.title')}</h1>
        </div>

        {/* ── Filter pills bar ── */}
        {!categoriesLoading && categoriesList.length > 0 && (
          <div className="categories-filter-wrap">
            <div className="categories-filter-scroll">
              {categoriesList.map((cat) => {
                const isActive = activeSlugs.includes(cat.slug)
                const pillStyle = isActive && cat.color
                  ? {
                      borderColor: cat.color,
                      backgroundColor: hexAlpha(cat.color, 0.15),
                      color: cat.color,
                    } 
                  : {}
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    className={`categories-pill${isActive ? ' active' : ''}`}
                    style={pillStyle}
                    onClick={() => toggleSlug(cat.slug)}
                    aria-pressed={isActive}
                  >
                    <span className="title">{cat.title}</span>
                    {isActive && (
                      <span
                        className="categories-pill-remove"
                        role="button"
                        aria-label={t('categories.removeFilter')}
                        onClick={(e) => { e.stopPropagation(); removeSlug(cat.slug) }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Products grid ── */}
        {productsLoading ? (
          <p className="categories-products-state">{t('common.loading')}</p>
        ) : products.length === 0 ? (
          <p className="categories-products-state">{t('categories.noProducts')}</p>
        ) : (
          <div className="categories-products-grid products">
            {products.map((product) => {
              const selectedColor =
                selectedColorByProduct[product.id] ?? product.defaultVariant?.color ?? null

              const filteredVariants = selectedColor
                ? product.variants.filter((v) => (v?.color ?? null) === selectedColor)
                : product.variants

              const activeVariant =
                filteredVariants.find((v) => v?.is_default) ??
                filteredVariants[0] ??
                product.defaultVariant

              const detailAttributes = Array.isArray(activeVariant?.attributes)
                ? activeVariant.attributes.filter((a) => a?.is_color !== true)
                : []

              return (
                <div key={product.id ?? product.title} className="item">
                  <div className="bottom-fade" />
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    data-fallback={product.isFallbackImage ? '1' : undefined}
                    onError={(e) => {
                      if (e.currentTarget.dataset.fallbackApplied) return
                      e.currentTarget.dataset.fallbackApplied = '1'
                      e.currentTarget.src = ASSETS.IMAGES.NOT_FOUND
                    }}
                  />
                  {product.colors.length > 0 && (
                    <div className={`product-color-rail ${language === LOCALES.FA ? 'rtl' : 'ltr'}`}>
                      <div className="product-color-list-vertical">
                        {product.colors.map((colorItem) => (
                          <button
                            key={`${product.id}-${colorItem.name}`}
                            type="button"
                            className={`product-color-dot ${selectedColor === colorItem.name ? 'active' : ''}`}
                            onClick={() => handleColorClick(product.id, colorItem.name)}
                            title={resolveLocalizedValue(colorItem.name, colorItem.name_i18n, language)}
                            aria-label={resolveLocalizedValue(colorItem.name, colorItem.name_i18n, language)}
                            style={{ backgroundColor: colorItem.swatch || '#E5E7EB' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="title">
                    <h4>{product.title}</h4>
                    {product.subtitle ? <p className="product-subtitle">{product.subtitle}</p> : null}
                    {detailAttributes.slice(0, 2).length > 0 && (
                      <div className="details">
                        {detailAttributes.slice(0, 2).map((attr) => (
                          <span key={`${product.id}-${activeVariant?.id}-${attr.key}`}>
                            {sanitizeSvg(attr?.icon_svg) ? (
                              <i
                                className="detail-attr-icon"
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: sanitizeSvg(attr.icon_svg) }}
                              />
                            ) : null}
                            {resolveLocalizedValue(attr.value, attr.value_i18n, language)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="curv-butn icon-bg">
                    <Link
                      to={product.short_link ? `${ROUTES.PRODUCTS}/${product.short_link}` : ROUTES.PRODUCTS}
                      className="vid"
                    >
                      <div className="icon">
                        <div className="icon-show">
                          <span>{activeVariant ? formatPrice(activeVariant.price, language) : '--'}</span>
                          <div className="unit">{t('products.currencyUnit')}</div>
                        </div>
                        <ArrowUpRight className="icon-hidden" />
                      </div>
                    </Link>
                    <div className="br-left-top">
                      <svg viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
                        <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z" />
                      </svg>
                    </div>
                    <div className="br-right-bottom">
                      <svg viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
                        <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories

