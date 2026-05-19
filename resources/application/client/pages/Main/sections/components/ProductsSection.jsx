import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { apiClient } from '../../../../services/apiClient'
import {
  resolveLocalizedText,
  resolveLocalizedValue,
  formatPrice,
  sanitizeSvg,
  normalizeArrayResponse,
} from '../../../../utils/index'
import { ASSETS, DEFAULTS, SWIPER_CONFIG, LOCALES } from '../../../../constants/index'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ArrowUpRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './SectionComponents.css'

function ProductsSection({ products }) {
  const { t, language } = useLanguage()
  const [apiProducts, setApiProducts] = useState([])
  const [isLoading, setIsLoading] = useState(products === undefined)
  const [selectedColorByProduct, setSelectedColorByProduct] = useState({})

  // Labels are now retrieved from translations
  const priceUnit = t('products.currencyUnit')
  const noVariantMessage = t('products.noVariant')
  const summaryTitle = t('products.summaryTitle')
  const defaultValue = t('products.defaultValue')

  useEffect(() => {
    if (products !== undefined) {
      return
    }

    let isMounted = true
    setIsLoading(true)

    apiClient
      .getClientProducts()
      .then((payload) => {
        if (!isMounted) return

        setApiProducts(normalizeArrayResponse(payload))
      })
      .catch(() => {
        if (!isMounted) return
        setApiProducts([])
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [products])

  const productsList = useMemo(() => {
    const source = Array.isArray(products) ? products : apiProducts

    return source
      .map((product) => {
        const variants = Array.isArray(product?.variants) ? product.variants : []
        const defaultVariant =
          product?.default_variant ?? variants.find((variant) => variant?.is_default) ?? variants[0] ?? null
        const rawImage = typeof product?.image === 'string' ? product.image.trim() : ''

        const title = resolveLocalizedText(product?.title, language)
        const subtitle = resolveLocalizedText(product?.subtitle, language)
        const description = resolveLocalizedText(product?.description, language)

        return {
          id: product?.id,
          short_link: product?.short_link ?? '',
          title,
          subtitle,
          description,
          image: rawImage ? rawImage : ASSETS.IMAGES.NOT_FOUND,
          isFallbackImage: !rawImage,
          variants,
          colors: Array.isArray(product?.colors) ? product.colors : [],
          summaryAttributes: Array.isArray(product?.summary_attributes) ? product.summary_attributes : [],
          defaultVariant,
        }
      })
      .filter((product) => product.title)
  }, [apiProducts, language, products])

  const handleColorClick = (productId, color) => {
    setSelectedColorByProduct((previous) => ({
      ...previous,
      [productId]: color,
    }))
  }

  if (isLoading || productsList.length === 0) {
    return null
  }

  return (
    <section className="products section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h5 className="section-subtitle">{t('products.subtitle')}</h5>
          <h1 className="section-title">{t('products.title')}</h1>
        </div>
        <Swiper
          key={language}
          dir={language === LOCALES.FA ? 'rtl' : 'ltr'}
          modules={[Pagination, Navigation]}
          {...SWIPER_CONFIG.PRODUCTS}
          loop={true}
          pagination={{ clickable: true }}
          navigation={false}
          className="products-swiper"
        >
          {productsList.map((product) => {
            const selectedColor = selectedColorByProduct[product.id] ?? product.defaultVariant?.color ?? null

            const filteredVariants = selectedColor
              ? product.variants.filter((variant) => (variant?.color ?? null) === selectedColor)
              : product.variants

            const activeVariant =
              filteredVariants.find((variant) => variant?.is_default) ??
              filteredVariants[0] ??
              product.defaultVariant

            const detailAttributes = Array.isArray(activeVariant?.attributes)
              ? activeVariant.attributes.filter((attribute) => attribute?.is_color !== true)
              : []

            return (
              <SwiperSlide key={product.id ?? product.title}>
                <div className="item">
                  <div className="bottom-fade"></div>
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    data-fallback={product.isFallbackImage ? '1' : undefined}
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallbackApplied) {
                        return
                      }

                      event.currentTarget.dataset.fallbackApplied = '1'
                      event.currentTarget.dataset.fallback = '1'
                      event.currentTarget.src = ASSETS.IMAGES.NOT_FOUND
                    }}
                  />
                  {product.colors.length > 0 ? (
                    <div className={`product-color-rail ${language === LOCALES.FA ? 'rtl' : 'ltr'}`}>
                      <div className="product-color-list-vertical">
                        {product.colors.map((colorItem) => (
                          <button
                            key={`${product.id}-${colorItem.name}`}
                            type="button"
                            className={`product-color-dot ${selectedColor === colorItem.name ? 'active' : ''}`}
                            onClick={() => handleColorClick(product.id, colorItem.name)}
                            title={resolveLocalizedValue(colorItem.name, colorItem.name_i18n, language)}
                            aria-label={resolveLocalizedValue(
                              colorItem.name,
                              colorItem.name_i18n,
                              language
                            )}
                            style={{
                              backgroundColor: colorItem.swatch || '#E5E7EB',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="title">
                    <h4>{product.title}</h4>
                    {product.subtitle ? <p className="product-subtitle">{product.subtitle}</p> : null}
                    {detailAttributes.slice(0, 2).length > 0 ? (
                      <div className="details">
                        {detailAttributes.slice(0, 2).map((attribute) => (
                          <span key={`${product.id}-${activeVariant?.id}-${attribute.key}`}>
                            {sanitizeSvg(attribute?.icon_svg) ? (
                              <i
                                className="detail-attr-icon"
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: sanitizeSvg(attribute.icon_svg) }}
                              />
                            ) : null}
                            {resolveLocalizedValue(attribute.value, attribute.value_i18n, language)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="curv-butn icon-bg">
                    <Link to={product.short_link ? `/products/${product.short_link}` : '/'} className="vid">
                      <div className="icon">
                        <div className="icon-show">
                          <span>{activeVariant ? formatPrice(activeVariant.price, language) : '--'}</span>
                          <div className="unit">{priceUnit}</div>
                        </div>
                        <ArrowUpRight className="icon-hidden" />
                      </div>
                    </Link>
                    <div className="br-left-top">
                      <svg
                        viewBox="0 0 11 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-11 h-11"
                      >
                        <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                      </svg>
                    </div>
                    <div className="br-right-bottom">
                      <svg
                        viewBox="0 0 11 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-11 h-11"
                      >
                        <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </section>
  )
}

export default ProductsSection
