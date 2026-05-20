import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { apiClient } from '../../../../services/apiClient'
import { resolveLocalizedText, normalizeArrayResponse } from '../../../../utils/index'
import { ASSETS, DEFAULTS, SWIPER_CONFIG, LOCALES } from '../../../../constants/index'
import { Star, Quote } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

function TestimonialsSection() {
  const { t, language } = useLanguage()
  const [items, setItems] = useState([])

  useEffect(() => {
    let mounted = true

    apiClient
      .getClientReviews({ lang: language })
      .then((res) => {
        if (!mounted) return
        setItems(normalizeArrayResponse(res))
      })
      .catch(() => {
        if (!mounted) return
        setItems([])
      })

    return () => {
      mounted = false
    }
  }, [language])

  const reviews = useMemo(() => {
    return items.map((item) => ({
      id: item?.id,
      name:
        item?.name ||
        resolveLocalizedText(item?.fullname, language) ||
        '',
      role: item?.user_type_label || (language === LOCALES.FA ? DEFAULTS.FALLBACK_ROLE.FA : DEFAULTS.FALLBACK_ROLE.EN),
      text: resolveLocalizedText(item?.text || item?.review, language) || '',
      image: item?.avatar || ASSETS.IMAGES.NOT_FOUND,
      star: Math.min(DEFAULTS.STAR_RATING, Math.max(1, Number(item?.star || DEFAULTS.STAR_RATING))),
    }))
  }, [items, language])

  // Disable loop if not enough slides to prevent Swiper warning
  const shouldEnableLoop = reviews.length > 3

  return (
    <section className="testimonials section-padding mt-15">
      <div className="container">
        <div className="row">
          <div className="text-center mb-12">
            <h5 className="section-subtitle">{t('testimonials.subtitle')}</h5>
            <h1 className="section-title">{t('testimonials.title')}</h1>
          </div>
          <div className="col-md-12">
            <Swiper
              key={language}
              dir={language === LOCALES.FA ? 'rtl' : 'ltr'}
              {...SWIPER_CONFIG.TESTIMONIALS}
              loop={shouldEnableLoop}
              autoplay={{ delay: DEFAULTS.SWIPER.AUTOPLAY_DELAY }}
            >
              {reviews.map((review, index) => (
                <SwiperSlide key={review.id ?? index}>
                  <div className="item">
                    <div className="stars">
                      <span className="rate">
                        {[...Array(review.star || DEFAULTS.STAR_RATING)].map((_, i) => (
                          <Star key={i} size={10} fill="#f5b754" color="#f5b754" />
                        ))}
                      </span>
                      <div className="shap-left-top">
                        <svg
                          className="w-11 h-11"
                          fill="none"
                          viewBox="0 0 11 11"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                        </svg>
                      </div>
                      <div className="shap-right-bottom">
                        <svg
                          className="w-11 h-11"
                          fill="none"
                          viewBox="0 0 11 11"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                        </svg>
                      </div>
                    </div>
                    <Quote size={30} color="#f5b754" className="quote-icon" />
                    <div className="text">
                      <p>{review.text}</p>
                    </div>
                    <div className="info mt-30">
                      <div className="img-curv">
                        <div className="img">
                          <img alt={review.name} src={review.image} />
                        </div>
                        <div className="shap-left-top">
                          <svg
                            className="w-11 h-11"
                            fill="none"
                            viewBox="0 0 11 11"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                          </svg>
                        </div>
                        <div className="shap-right-bottom">
                          <svg
                            className="w-11 h-11"
                            fill="none"
                            viewBox="0 0 11 11"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="author">
                        <h6>{review.name}</h6>
                        <p>{review.role}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
