import { useEffect, useMemo, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { apiClient } from '../../apis'
import { ROUTES, LOCALES } from '../../constants/index'
import { resolveLocalizedText, formatPrice } from '../../utils/index'
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
    return normalizeProductsResponse(rawProducts)
      .map((product) => {
        const rawImage = typeof product?.image === 'string' ? product.image.trim() : ''
        return {
          id: product?.id,
          short_link: product?.short_link ?? '',
          title: resolveLocalizedText(product?.title, language),
          subtitle: resolveLocalizedText(product?.subtitle, language),
          image: rawImage || DEFAULT_IMAGE,
          price: product?.default_variant?.price ?? null,
        }
      })
      .filter((p) => p.title)
  }, [rawProducts, language])

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
          <div className="categories-products-grid">
            {products.map((product) => (
              <Link
                key={product.id}
                to={product.short_link ? `${ROUTES.PRODUCTS}/${product.short_link}` : ROUTES.PRODUCTS}
                className="categories-product-card"
              >
                <div className="categories-product-card-img">
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.dataset.fallbackApplied) return
                      e.currentTarget.dataset.fallbackApplied = '1'
                      e.currentTarget.src = DEFAULT_IMAGE
                    }}
                  />
                </div>
                <div className="categories-product-card-body">
                  <h3 className="categories-product-card-title">{product.title}</h3>
                  {product.subtitle ? (
                    <p className="categories-product-card-subtitle">{product.subtitle}</p>
                  ) : null}
                  {product.price !== null ? (
                    <p className="categories-product-card-price">
                      {formatPrice(product.price, language)}
                      <span className="categories-product-card-unit"> {t('common.currencyUnit')}</span>
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories

