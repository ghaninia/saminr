import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { apiClient } from '../../../../apis'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ArrowUpRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './SectionComponents.css'

const DEFAULT_PRODUCT_IMAGE = '/images/file-corrupted.svg'

function normalizeProductsResponse(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return Array.isArray(payload?.data) ? payload.data : []
}

function resolveLocalizedText(value, locale) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value?.[locale] ?? value?.fa ?? value?.en ?? ''
  }

  return ''
}

function resolveLocalizedValue(value, valueI18n, locale) {
  if (valueI18n && typeof valueI18n === 'object' && !Array.isArray(valueI18n)) {
    return String(valueI18n?.[locale] ?? valueI18n?.fa ?? valueI18n?.en ?? value ?? '')
  }

  return String(value ?? '')
}

function formatPrice(price, language) {
  if (!Number.isFinite(Number(price))) {
    return '--'
  }

  try {
    return new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US').format(Number(price))
  } catch {
    return String(price)
  }
}

function sanitizeSvg(svg) {
  if (typeof svg !== 'string') {
    return ''
  }

  const trimmed = svg.trim()
  return trimmed.startsWith('<svg') ? trimmed : ''
}

function ProductsSection({ products }) {
  const { t, language } = useLanguage()
  const [apiProducts, setApiProducts] = useState([])
  const [isLoading, setIsLoading] = useState(products === undefined)
  const [selectedColorByProduct, setSelectedColorByProduct] = useState({})

  const labels = language === 'fa'
    ? {
        priceUnit: 'تومان',
        noVariant: 'واریانتی برای این رنگ پیدا نشد',
        summaryTitle: 'ویژگی‌ها',
        defaultValue: 'پیش‌فرض',
      }
    : {
        priceUnit: 'Toman',
        noVariant: 'No variants found for this color',
        summaryTitle: 'Summary',
        defaultValue: 'Default',
      }

  useEffect(() => {
    if (products !== undefined) {
      return
    }

    let isMounted = true
    setIsLoading(true)

    apiClient
      .getClientProducts()
      .then((payload) => {
        if (!isMounted) {
          return
        }

        setApiProducts(normalizeProductsResponse(payload))
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setApiProducts([])
      })
      .finally(() => {
        if (!isMounted) {
          return
        }

        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [products])

  const productsList = useMemo(() => {
    const source = Array.isArray(products) ? products : apiProducts

    return source.map((product) => {
      const variants = Array.isArray(product?.variants) ? product.variants : []
      const defaultVariant = product?.default_variant ?? variants.find((variant) => variant?.is_default) ?? variants[0] ?? null
      const rawImage = typeof product?.image === 'string' ? product.image.trim() : ''

      const title = resolveLocalizedText(product?.title, language)
      const subtitle = resolveLocalizedText(product?.subtitle, language)
      const description = resolveLocalizedText(product?.description, language)

      return {
        id: product?.id,
        title,
        subtitle,
        description,
        image: rawImage ? rawImage : DEFAULT_PRODUCT_IMAGE,
        isFallbackImage: !rawImage,
        variants,
        colors: Array.isArray(product?.colors) ? product.colors : [],
        summaryAttributes: Array.isArray(product?.summary_attributes) ? product.summary_attributes : [],
        defaultVariant,
      }
    }).filter((product) => product.title)
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
    <section className={`products section-padding`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h5 className="section-subtitle">{t('products.subtitle')}</h5>
          <h1 className="section-title">{t('products.title')}</h1>
        </div>
        <Swiper
          key={language}
          dir={language === 'fa' ? 'rtl' : 'ltr'}
          modules={[Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          slidesPerGroup={1}
          loop={true}
          pagination={{ clickable: true }}
          navigation={false}
          breakpoints={{
            768: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            1024: {
              slidesPerView: 3,
              slidesPerGroup: 3,
            },
          }}
          className="products-swiper"
        >
          {productsList.map((product) => {
            const selectedColor = selectedColorByProduct[product.id] ?? product.defaultVariant?.color ?? null

            const filteredVariants = selectedColor
              ? product.variants.filter((variant) => (variant?.color ?? null) === selectedColor)
              : product.variants

            const activeVariant = filteredVariants.find((variant) => variant?.is_default)
              ?? filteredVariants[0]
              ?? product.defaultVariant

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
                    event.currentTarget.src = DEFAULT_PRODUCT_IMAGE
                  }}
                />
                {product.colors.length > 0 ? (
                  <div className={`product-color-rail ${language === 'fa' ? 'rtl' : 'ltr'}`}>
                    <div className="product-color-list-vertical">
                      {product.colors.map((colorItem) => (
                        <button
                          key={`${product.id}-${colorItem.name}`}
                          type="button"
                          className={`product-color-dot ${selectedColor === colorItem.name ? 'active' : ''}`}
                          onClick={() => handleColorClick(product.id, colorItem.name)}
                          title={resolveLocalizedValue(colorItem.name, colorItem.name_i18n, language)}
                          aria-label={resolveLocalizedValue(colorItem.name, colorItem.name_i18n, language)}
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
                  <a href="#" className="vid">
                    <div className="icon">
                      <div className="icon-show">
                        <span>{activeVariant ? formatPrice(activeVariant.price, language) : '--'}</span>
                        <div className="unit">{labels.priceUnit}</div>
                      </div>
                      <ArrowUpRight className="icon-hidden" />
                    </div>
                  </a>
                  <div className="br-left-top">
                    <svg viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
                      <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                    </svg>
                  </div>
                  <div className="br-right-bottom">
                    <svg viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
                      <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )})}
        </Swiper>
      </div>
    </section>
  )
}

export default ProductsSection
