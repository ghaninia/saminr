import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ArrowUpRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './SectionComponents.css'

function CategoriesSection({ categories = [] }) {
  const { t } = useLanguage()
  const { theme } = useTheme()

  const defaultCategories = [
    {
      title: 'Wood Wick Candle',
      subtitle: 'Natural wood wick',
      image: '/images/category1.webp'
    },
    {
      title: 'Soy Candle',
      subtitle: 'Eco-friendly soy wax',
      image: '/images/category2.webp'
    },
    {
      title: 'Sparklers',
      subtitle: 'Sparkling effects',
      image: '/images/category3.webp'
    },
    {
      title: 'Trick Candle',
      subtitle: 'Fun trick candles',
      image: '/images/category4.webp'
    },
    {
      title: 'Floating Candle',
      subtitle: 'Floating on water',
      image: '/images/category5.webp'
    },
    {
      title: 'Citronella Candle',
      subtitle: 'Mosquito repellent',
      image: '/images/category6.webp'
    },
    {
      title: 'Taper Candle',
      subtitle: 'Classic taper design',
      image: '/images/category7.webp'
    },
    {
      title: 'Pillar Candle',
      subtitle: 'Sturdy pillar shape',
      image: '/images/category8.webp'
    },
  ]

  const categoriesList = categories.length > 0 ? categories : defaultCategories

  return (
    <section className={`categories section-padding`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h6 className="section-subtitle">{t('categories.subtitle')}</h6>
          <h1 className="section-title">{t('categories.title')}</h1>
        </div>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          pagination={{ clickable: true }}
          navigation={false}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="categories-swiper"
        >
          {categoriesList.map((category, index) => (
            <SwiperSlide key={index}>
              <div className="item mb-15">
                <div className="img">
                  <img src={category.image} className="img-fluid" alt={category.title} />
                </div>
                <div className="info">
                  <h2 className="title">{category.title}</h2>
                  <p className="subtitle">{category.subtitle}</p>
                </div>
                <div className="curv-butn">
                  <a href="#" className="vid">
                    <div className="icon">
                      <ArrowUpRight />
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
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default CategoriesSection