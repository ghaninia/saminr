import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useGlobalLoading } from '../../contexts/LoadingContext'
import { normalizeObjectResponse } from '../../utils/index'
import { LOCALES } from '../../constants/index'
import ImageLightbox from '../../components/ImageLightbox'
import PriceSection from './PriceSection'
import ColorSelector from './ColorSelector'
import GallerySection from './GallerySection'
import SpecsSection from './SpecsSection'
import {
  normalizeProduct,
  getGalleryImages,
  getImageMediaItems,
  getVisibleVariants,
  getActiveVariant,
  getInitialColor,
  getRenderedSpecs,
  getTextDirection,
} from './productDetailsUtils'

export default function ProductDetails() {
  const { shortLink } = useParams()
  const { language, t } = useLanguage()
  const { startLoading, finishLoading } = useGlobalLoading()
  const [product, setProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Load product data
  useEffect(() => {
    let isMounted = true
    startLoading()

    apiClient
      .getClientProduct(shortLink)
      .then((payload) => {
        if (isMounted) {
          const nextProduct = normalizeObjectResponse(payload)
          setProduct(nextProduct)
        }
      })
      .catch(() => {
        if (isMounted) {
          setProduct(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          finishLoading()
        }
      })

    return () => {
      isMounted = false
    }
  }, [shortLink, startLoading, finishLoading])

  // Initialize color selection on product change
  useEffect(() => {
    if (product) {
      const normalized = normalizeProduct(product, language, t)
      setSelectedColor(getInitialColor(normalized))
    }
  }, [product, language, t])

  if (!product) {
    return null
  }

  const normalized = normalizeProduct(product, language, t)
  const galleryImages = getGalleryImages(normalized, t)
  const imageItems = getImageMediaItems(galleryImages)
  const visibleVariants = getVisibleVariants(normalized, selectedColor)
  const activeVariant = getActiveVariant(visibleVariants, normalized)
  const { specs, source } = getRenderedSpecs(activeVariant, normalized, language)
  const direction = getTextDirection(language)

  return (
    <>
      <section
        className="banner-header section-padding bg-img"
        data-overlay-dark="5"
        data-background={normalized.image}
        style={{ backgroundImage: `url('${normalized.image}')` }}
      >
        <div className="v-middle">
          <div className="container">
            <div className="col-md-12">
              <h1>{normalized.title}</h1>
              <h6>{normalized.subtitle}</h6>
            </div>
          </div>
        </div>
      </section>

      <section className="car-details section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-8">
              <div className="title">{t('productDetails.overview')}</div>

              <div className="description">
                {normalized.description || t('productDetails.noDescription')}
              </div>

              {imageItems.length > 0 && (
                <GallerySection
                  imageItems={imageItems}
                  language={language}
                  t={t}
                  onImageClick={(index) => {
                    setLightboxIndex(index)
                    setIsLightboxOpen(true)
                  }}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-6 overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f]">
                <PriceSection variant={activeVariant} language={language} t={t} />

                <div className="space-y-6 p-6">
                  <ColorSelector
                    colors={normalized.colors}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                    language={language}
                    t={t}
                  />

                  <SpecsSection specs={specs} source={source} t={t} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ImageLightbox
        isOpen={isLightboxOpen}
        items={imageItems}
        initialIndex={lightboxIndex}
        dir={direction}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  )
}
