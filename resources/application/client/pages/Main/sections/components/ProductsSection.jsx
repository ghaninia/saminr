import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ArrowUpRight, DoorOpen, Cog, User } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './SectionComponents.css'

function ProductsSection({ products = [] }) {
  const { t, language } = useLanguage()
  const { theme } = useTheme()

  const defaultProducts = [
    {
      number: '01.',
      title: t('products.product1.title'),
      description: t('products.product1.description'),
      details: t('products.product1.details'),
      price: '100',
      unit: 'تومان',
      image: '/images/candle1.jpg'
    },
    {
      number: '02.',
      title: t('products.product2.title'),
      description: t('products.product2.description'),
      details: t('products.product2.details'),
      price: '200',
      unit: 'تومان',
      image: '/images/candle2.jpg'
    },
    {
      number: '03.',
      title: t('products.product3.title'),
      description: t('products.product3.description'),
      details: t('products.product3.details'),
      price: '300',
      unit: 'تومان',
      image: '/images/candle3.jpg'
    },
  ]

  const productsList = products.length > 0 ? products : defaultProducts

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
          className="products-swiper"
        >
          {productsList.map((product, index) => (
            <SwiperSlide key={index}>
              <div className="item">
                <div className="bottom-fade"></div>
                <img src={product.image} alt={product.title} />
                <div className="title">
                  <h4>{product.title}</h4>
                  <div className="details">
                    <span><DoorOpen size={16} style={{ marginLeft: '5px', marginRight: '5px' }} />{product.details.passengers}</span>
                    <span><Cog size={16} style={{ marginLeft: '5px', marginRight: '5px' }} />{product.details.transmission}</span>
                    <span><User size={16} style={{ marginLeft: '5px', marginRight: '5px' }} />{product.details.age}</span>
                  </div>
                </div>
                <div className="curv-butn icon-bg">
                  <a href="#" className="vid">
                    <div className="icon">
                      <div className="icon-show">
                        <span>{product.price}</span>
                        <div className="unit">{product.unit}</div>
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
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default ProductsSection
