import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, CircleDollarSign, Package, PlayCircle } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useGlobalLoading } from '../../contexts/LoadingContext'
import {
  resolveLocalizedText,
  resolveLocalizedValue,
  formatPrice,
  sanitizeSvg,
  normalizeObjectResponse,
} from '../../utils/index'
import { ASSETS, LOCALES } from '../../constants/index'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import ImageLightbox from '../../components/ImageLightbox'

export default function ProductDetails() {
  const { shortLink } = useParams()
  const { language, t } = useLanguage()
  const { startLoading, finishLoading } = useGlobalLoading()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    let isMounted = true
    startLoading()
    setError('')

    apiClient
      .getClientProduct(shortLink)
      .then((payload) => {
        if (!isMounted) return
        const nextProduct = normalizeObjectResponse(payload)
        setProduct(nextProduct)
      })
      .catch((requestError) => {
        if (!isMounted) return
        setError(requestError?.message || t('productDetails.loadError'))
      })
      .finally(() => {
        if (!isMounted) return
        finishLoading()
      })

    return () => {
      isMounted = false
    }
  }, [shortLink, t, startLoading, finishLoading])

  const normalizedProduct = useMemo(() => {
    if (!product) return null

    const title = resolveLocalizedText(product?.title, language)
    const subtitle = resolveLocalizedText(product?.subtitle, language)
    const description = resolveLocalizedText(product?.description, language)
    const image =
      typeof product?.image === 'string' && product.image.trim()
        ? product.image
        : ASSETS.IMAGES.NOT_FOUND
    const gallery = Array.isArray(product?.gallery)
      ? product.gallery.filter((item) => typeof item === 'string' && item.trim())
      : []
    const introVideo =
      typeof product?.intro_video === 'string' && product.intro_video.trim()
        ? product.intro_video
        : ''
    const variants = Array.isArray(product?.variants) ? product.variants : []
    const colors = Array.isArray(product?.colors) ? product.colors : []
    const summaryAttributes = Array.isArray(product?.summary_attributes)
      ? product.summary_attributes
      : []
    const defaultVariant =
      product?.default_variant ??
      variants.find((variant) => variant?.is_default) ??
      variants[0] ??
      null
    const mediaItems = [
      { type: 'image', url: image, label: title || t('productDetails.mediaImageFallback') },
      ...gallery.map((url, index) => ({
        type: 'image',
        url,
        label: `${title || t('productDetails.mediaProductFallback')} ${index + 1}`,
      })),
      ...(introVideo
        ? [
            {
              type: 'video',
              url: introVideo,
              label: `${title || t('productDetails.mediaProductFallback')} ${t('productDetails.mediaVideoSuffix')}`,
            },
          ]
        : []),
    ]

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
      summaryAttributes,
      defaultVariant,
      mediaItems,
    }
  }, [product, language, t])

  useEffect(() => {
    if (!normalizedProduct) return
    setSelectedMedia(normalizedProduct.mediaItems[0] ?? null)
    setSelectedColor(normalizedProduct.defaultVariant?.color ?? normalizedProduct.colors[0]?.name ?? null)
  }, [normalizedProduct])

  const visibleVariants = useMemo(() => {
    if (!normalizedProduct) return []
    if (!selectedColor) return normalizedProduct.variants
    return normalizedProduct.variants.filter((variant) => (variant?.color ?? null) === selectedColor)
  }, [normalizedProduct, selectedColor])

  const activeVariant = useMemo(() => {
    if (!normalizedProduct) return null
    return (
      visibleVariants.find((variant) => variant?.is_default) ??
      visibleVariants[0] ??
      normalizedProduct.defaultVariant ??
      null
    )
  }, [normalizedProduct, visibleVariants])


  const labels = {
    overview: t('productDetails.overview'),
    gallery: t('productDetails.gallery'),
    colors: t('productDetails.colors'),
    specifications: t('productDetails.specifications'),
    summary: t('productDetails.summary'),
    priceSuffix: t('productDetails.priceSuffix'),
    unit: t('productDetails.unit'),
    noDescription: t('productDetails.noDescription'),
    noMedia: t('productDetails.noMedia'),
    noSpecs: t('productDetails.noSpecs'),
  }

  const summarySpecs = normalizedProduct.summaryAttributes
    .map((attribute, index) => {
      const label = resolveLocalizedValue(
        attribute?.label,
        attribute?.label_i18n,
        language
      )

      const localizedValues = Array.isArray(attribute?.values_i18n)
        ? attribute.values_i18n
            .map((entry) => {
              if (typeof entry === 'string') return entry
              if (entry && typeof entry === 'object') {
                return entry?.[language] ?? entry?.fa ?? entry?.en ?? ''
              }
              return ''
            })
            .filter(Boolean)
        : []

      const rawValues = Array.isArray(attribute?.values)
        ? attribute.values.map((entry) => String(entry ?? '')).filter(Boolean)
        : []

      const fallbackDefaultValue = resolveLocalizedValue(
        attribute?.default_value,
        attribute?.default_value_i18n,
        language
      )
      const value = localizedValues.join('، ') || rawValues.join('، ') || fallbackDefaultValue

      return {
        key: String(attribute?.key ?? index),
        label,
        value,
        iconSvg: sanitizeSvg(attribute?.icon_svg),
      }
    })
    .filter((item) => item.label && item.value)

  const variantSpecs = Array.isArray(activeVariant?.attributes)
    ? activeVariant.attributes
        .filter((attribute) => attribute?.is_color !== true)
        .map((attribute, index) => ({
          key: String(attribute?.key ?? index),
          label: resolveLocalizedValue(
            attribute?.label ?? attribute?.key,
            attribute?.label_i18n,
            language
          ),
          value: resolveLocalizedValue(attribute?.value, attribute?.value_i18n, language),
          iconSvg: sanitizeSvg(attribute?.icon_svg),
        }))
        .filter((item) => item.label && item.value)
    : []

  const renderedSpecs = variantSpecs.length > 0 ? variantSpecs : summarySpecs
  const mainMedia = selectedMedia ?? normalizedProduct.mediaItems[0] ?? null
  const imageMediaItems = normalizedProduct.mediaItems.filter(
    (item) => item?.type === 'image' && item?.url
  )

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  return (
    <>
      <section
        className="banner-header section-padding bg-img"
        data-overlay-dark="5"
        data-background={normalizedProduct.image}
        style={{ backgroundImage: `url('${normalizedProduct.image}')` }}
      >
        <div className="v-middle">
          <div className="container">
            <div className="col-md-12">
              <h1>{normalizedProduct.title}</h1>
              <h6>{normalizedProduct.subtitle}</h6>
            </div>
          </div>
        </div>
      </section>
      <section className="car-details section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <div className="title">{labels.overview}</div>

              <div className="description">
                {normalizedProduct.description || labels.noDescription}
              </div>

              {mainMedia ? (
                <div className="gallery gallery-items">
                  <div className="title">{labels.gallery}</div>
                  <div className="space-y-4">
                    <Swiper
                      key={language}
                      dir={language === LOCALES.FA ? 'rtl' : 'ltr'}
                      spaceBetween={30}
                      slidesPerView={1}
                      slidesPerGroup={1}
                      loop={false}
                      pagination={{ clickable: false }}
                      navigation={false}
                      breakpoints={{
                        768: {
                          slidesPerView: 2,
                          slidesPerGroup: 2,
                        },
                        1024: {
                          slidesPerView: 2,
                          slidesPerGroup: 2,
                        },
                      }}
                      className="products-swiper product-gallery-swiper"
                    >
                      {imageMediaItems.length > 0
                        ? imageMediaItems.map((item, index) => {
                            return (
                              <SwiperSlide key={item.id ?? item.label}>
                                <div className="gallery-box">
                                  <button
                                    type="button"
                                    className="gallery-popup-trigger"
                                    onClick={() => handleOpenLightbox(index)}
                                    aria-label={item.label}
                                    title={item.label}
                                  >
                                    <div
                                      className="gallery-img"
                                      role="img"
                                      aria-label={item.label}
                                      style={{ backgroundImage: `url(${item.url})` }}
                                    />
                                  </button>
                                </div>
                              </SwiperSlide>
                            )
                          })
                        : null}
                    </Swiper>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-6 overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f]">
                <div className="sidebar-car px-6 py-5 text-[#1b1b1b]">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CircleDollarSign className="h-4 w-4" />
                    <span>{labels.priceSuffix}</span>
                  </div>
                  <h4 className="mt-2 text-3xl font-bold leading-tight">
                    {activeVariant ? formatPrice(activeVariant.price, language) : '--'}
                  </h4>
                  {activeVariant?.unit ? (
                    <p className="mt-1 text-xs font-medium opacity-80">
                      {labels.unit}: {activeVariant.unit}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-6 p-6">
                  {normalizedProduct.colors.length > 0 ? (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-white">{labels.colors}</p>
                      <div className="flex flex-wrap gap-2">
                        {normalizedProduct.colors.map((colorItem) => {
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
                              onClick={() => setSelectedColor(colorItem.name)}
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
                  ) : null}

                  <div>
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                      <CheckCircle2 className="h-4 w-4 text-[#f5b754]" />
                      {variantSpecs.length > 0 ? labels.specifications : labels.summary}
                    </p>

                    {renderedSpecs.length > 0 ? (
                      <div className="space-y-3">
                        {renderedSpecs.map((item) => (
                          <div
                            key={item.key}
                            className="grid grid-cols-2 gap-3 border-b border-white/10 pb-3 text-sm last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-center gap-2 text-slate-400">
                              {item.iconSvg ? (
                                <span
                                  className="inline-flex h-5 w-5 items-center justify-center text-[#f5b754]"
                                  dangerouslySetInnerHTML={{ __html: item.iconSvg }}
                                />
                              ) : null}
                              <span>{item.label}</span>
                            </div>
                            <p className="text-right font-medium text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/20 px-4 py-5 text-sm text-slate-400">
                        {labels.noSpecs}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <ImageLightbox
        isOpen={isLightboxOpen}
        items={imageMediaItems}
        initialIndex={lightboxIndex}
        dir={language === LOCALES.FA ? 'rtl' : 'ltr'}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  )
}
