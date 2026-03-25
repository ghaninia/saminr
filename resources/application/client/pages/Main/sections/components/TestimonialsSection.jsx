import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Star, Quote } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

function TestimonialsSection() {
  const { t, language } = useLanguage()
  const { theme } = useTheme()

  const reviews = [
    {
      name: 'پوریا میرزایی',
      role: 'مشتری',
      text: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.',
      image: '/images/candle1.jpg'
    },
    {
      name: 'نسترن سلطانی',
      role: 'مشتری',
      text: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.',
      image: '/images/candle2.jpg'
    },
    {
      name: 'فروغ فدایی',
      role: 'مشتری',
      text: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.',
      image: '/images/candle3.jpg'
    }
  ]

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
              dir={language === 'fa' ? 'rtl' : 'ltr'}
              spaceBetween={30}
              slidesPerView={3}
              loop={true}
              autoplay={{ delay: 3000 }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
            >
              {reviews.map((review, index) => (
                <SwiperSlide key={index}>
                  <div className="item">
                    <div className="stars">
                      <span className="rate">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill="#f5b754" color="#f5b754" />
                        ))}
                      </span>
                      <div className="shap-left-top">
                        <svg className="w-11 h-11" fill="none" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                        </svg>
                      </div>
                      <div className="shap-right-bottom">
                        <svg className="w-11 h-11" fill="none" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
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
                          <img alt="" src={review.image} />
                        </div>
                        <div className="shap-left-top">
                          <svg className="w-11 h-11" fill="none" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z"></path>
                          </svg>
                        </div>
                        <div className="shap-right-bottom">
                          <svg className="w-11 h-11" fill="none" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
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
