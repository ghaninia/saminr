import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useGlobalLoading } from '../../contexts/LoadingContext'
import { normalizeObjectResponse } from '../../utils/index'
import { LOCALES, ASSETS } from '../../constants/index'
import ImageLightbox from '../../components/ImageLightbox'
import PriceSidebar from './PriceSidebar'
import GallerySection from './GallerySection'
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

import { useCart } from '../../contexts/CartContext'

export default function ProductDetails() {
  const { shortLink } = useParams()
  const { language, t } = useLanguage()
  const { startLoading, finishLoading } = useGlobalLoading()
  const { cartItems, addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  const priceUnit = t('products.currencyUnit')

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

  // Initialize selection on product change
  useEffect(() => {
    if (product) {
      const normalized = normalizeProduct(product, language, t)
      const initialColor = getInitialColor(normalized)
      setSelectedColor(initialColor)

      // Initialize other attributes with default/first values of the default variant
      const defaultVariant = normalized.defaultVariant
      const initialAttrs = {}
      if (defaultVariant && defaultVariant.attributes) {
        defaultVariant.attributes.forEach((attr) => {
          const isColor = attr.isColor || attr.is_color
          if (!isColor) {
            initialAttrs[attr.key] = attr.value
          }
        })
      }
      setSelectedAttributes(initialAttrs)
      setQuantity(1)
    }
  }, [product, language, t])

  if (!product) {
    return null
  }

  const normalized = normalizeProduct(product, language, t)
  const galleryImages = getGalleryImages(normalized, t)
  const imageItems = getImageMediaItems(galleryImages)

  // Filter variants first by selected color
  let visibleVariants = getVisibleVariants(normalized, selectedColor)

  // Find active variant matching both selected color AND selected attributes
  let activeVariant = visibleVariants.find((variant) => {
    if (selectedColor && variant.color !== selectedColor) return false
    
    // Check if variant has all of the selected attributes
    return Object.entries(selectedAttributes).every(([key, value]) => {
      const attr = variant.attributes?.find((a) => a.key === key)
      return attr && attr.value === value
    })
  })

  // Fallback: If no exact variant matches the combined options, select the first match in the color group
  if (!activeVariant && visibleVariants.length > 0) {
    activeVariant = visibleVariants[0]
  }

  // Intercepting variant attribute / color changes for "Add to Cart confirmation"
  const checkAndConfirmCartAdd = (actionOnConfirm) => {
    const isAlreadyInCart = cartItems.some(
      (item) => item.productId === normalized.id && item.selectedVariant.id === activeVariant?.id
    );

    // If quantity > 1 OR current variant is already in cart, show confirm confirmation modal
    if ((quantity > 1 || isAlreadyInCart) && activeVariant) {
      const confirmed = window.confirm(t('productDetails.addToCartConfirm'));
      if (confirmed) {
        // Add to cart first
        addToCart({
          productId: normalized.id,
          productTitle: normalized.title,
          slug: shortLink,
          image: normalized.image,
          selectedVariant: activeVariant,
          variantAttributes: selectedAttributes,
          quantity,
          price: activeVariant.price,
          product: normalized, // Save entire normalized product with full i18n properties
          rawAttributes: normalized.attributes // Save original translated/raw attributes array
        });
        setQuantity(1);
        actionOnConfirm();
      }
      // If Canceled, do NOT perform actionOnConfirm (which reverts selection change)
    } else {
      actionOnConfirm();
    }
  };

  const handleColorChange = (newColor) => {
    checkAndConfirmCartAdd(() => {
      setSelectedColor(newColor);
    });
  };

  const handleAttributeChange = (key, value) => {
    checkAndConfirmCartAdd(() => {
      setSelectedAttributes((prev) => ({
        ...prev,
        [key]: value,
      }))
    });
  }

  const { specs } = getRenderedSpecs(activeVariant, normalized, language)
  const direction = getTextDirection(language)

  return (
    <>
      <section
        className="banner-header section-padding bg-img"
        data-overlay-dark="5"
        style={normalized.isFallbackImage ? {} : { backgroundImage: `url('${normalized.image}')` }}
      >
        {
          normalized.isFallbackImage && (
            <div className="fallback-image-placeholder">
              <img
                src={ASSETS.IMAGES.NOT_FOUND}
                alt={normalized.title}
                loading="lazy"
              />
            </div>
          )
        }

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

              {normalized.gallery && normalized.gallery.length > 0 && imageItems.length > 0 && (
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
              <PriceSidebar
                productId={normalized.id}
                productTitle={normalized.title}
                slug={shortLink}
                image={normalized.image}
                variant={activeVariant}
                specs={specs}
                colors={normalized.colors}
                selectedColor={selectedColor}
                onColorChange={handleColorChange}
                attributes={normalized.attributes}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
                quantity={quantity}
                onQuantityChange={setQuantity}
                language={language}
                t={t}
                priceUnit={priceUnit}
                productRaw={normalized}
              />
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
