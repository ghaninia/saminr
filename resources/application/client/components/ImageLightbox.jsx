import { useEffect, useMemo, useState } from 'react'
import './ImageLightbox.css'

function clampIndex(index, length) {
  if (length <= 0) return 0
  if (index < 0) return length - 1
  if (index >= length) return 0
  return index
}

export default function ImageLightbox({ isOpen, items = [], initialIndex = 0, onClose, dir }) {
  const validItems = useMemo(
    () => items.filter((item) => item && typeof item.url === 'string' && item.url.trim()),
    [items],
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [slideMotion, setSlideMotion] = useState('')
  const resolvedDir = dir || (typeof document !== 'undefined' ? document.documentElement?.dir : 'ltr') || 'ltr'
  const isRtl = resolvedDir === 'rtl'

  useEffect(() => {
    if (!isOpen) return
    setActiveIndex(clampIndex(initialIndex, validItems.length))
    setSlideMotion('')
  }, [initialIndex, isOpen, validItems.length])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }

      if (event.key === 'ArrowRight') {
        goNext()
      }

      if (event.key === 'ArrowLeft') {
        goPrev()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose, validItems.length, isRtl])

  if (!isOpen || validItems.length === 0) {
    return null
  }

  const activeItem = validItems[activeIndex]

  const moveSlide = (delta, motionClass) => {
    if (validItems.length <= 1) return
    setSlideMotion(motionClass)
    setActiveIndex((current) => clampIndex(current + delta, validItems.length))
  }

  const goNext = () => {
    moveSlide(isRtl ? -1 : 1, 'is-next')
  }

  const goPrev = () => {
    moveSlide(isRtl ? 1 : -1, 'is-prev')
  }

  const prevArrow = '‹'
  const nextArrow = '›'

  return (
    <div className={`image-lightbox ${isRtl ? 'image-lightbox--rtl' : 'image-lightbox--ltr'}`} role="dialog" aria-modal="true" aria-label="Image preview">
      <div className="image-lightbox__backdrop" onClick={onClose} />

      <div className="image-lightbox__content">
        <button type="button" className="image-lightbox__close" onClick={onClose} aria-label="Close popup">
          ×
        </button>

        <button type="button" className="image-lightbox__nav image-lightbox__nav--prev" onClick={goPrev} aria-label="Previous image">
          {prevArrow}
        </button>

        <img
          src={activeItem.url}
          alt={activeItem.label || `Image ${activeIndex + 1}`}
          className={`image-lightbox__image ${slideMotion}`.trim()}
          onAnimationEnd={() => setSlideMotion('')}
        />

        <button type="button" className="image-lightbox__nav image-lightbox__nav--next" onClick={goNext} aria-label="Next image">
          {nextArrow}
        </button>

        {validItems.length > 1 ? (
          <div className="image-lightbox__counter">
            {activeIndex + 1} / {validItems.length}
          </div>
        ) : null}
      </div>
    </div>
  )
}
