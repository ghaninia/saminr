import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { LOCALES } from '../../constants/index'

export default function GallerySection({
  imageItems,
  language,
  t,
  onImageClick,
}) {
  if (!imageItems || imageItems.length === 0) {
    return null
  }

  const direction = language === LOCALES.FA ? 'rtl' : 'ltr'

  return (
    <div className="gallery gallery-items">
      <div className="title">{t('productDetails.gallery')}</div>
      <div className="space-y-4">
        <Swiper
          key={language}
          dir={direction}
          spaceBetween={30}
          slidesPerView={1}
          slidesPerGroup={1}
          loop={false}
          pagination={{ clickable: false }}
          navigation={false}
          modules={[Pagination]}
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
          {imageItems.map((item, index) => (
            <SwiperSlide key={item.label}>
              <div className="gallery-box">
                <button
                  type="button"
                  className="gallery-popup-trigger"
                  onClick={() => onImageClick(index)}
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
          ))}
        </Swiper>
      </div>
    </div>
  )
}
