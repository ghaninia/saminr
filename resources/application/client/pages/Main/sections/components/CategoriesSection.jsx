import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { apiClient } from '../../../../apis'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ArrowUpRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './SectionComponents.css'

const DEFAULT_CATEGORY_IMAGE = '/images/file-corrupted.svg'

function normalizeCategoriesResponse(payload) {
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

function CategoriesSection({ categories }) {
  const { t, language } = useLanguage()
  const { theme } = useTheme()
  const [apiCategories, setApiCategories] = useState([])
  const [isLoading, setIsLoading] = useState(categories === undefined)

  useEffect(() => {
    if (categories !== undefined) {
      return
    }

    let isMounted = true
    setIsLoading(true)

    apiClient
      .getClientCategories()
      .then((payload) => {
        if (!isMounted) {
          return
        }

        setApiCategories(normalizeCategoriesResponse(payload))
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setApiCategories([])
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
  }, [categories])

  const categoriesList = useMemo(() => {
    const source = Array.isArray(categories) ? categories : apiCategories

    return source
      .map((category) => {
        const title = resolveLocalizedText(category?.title, language)
        const subtitle = resolveLocalizedText(category?.subtitle, language)
        const rawImage = typeof category?.image === 'string' ? category.image.trim() : ''
        const isFallbackImage = !rawImage

        return {
          id: category?.id,
          image: rawImage ? rawImage : DEFAULT_CATEGORY_IMAGE,
          isFallbackImage,
          title,
          subtitle
        }
      })
      .filter((category) => category.title)
  }, [apiCategories, categories, language])

  if (isLoading || categoriesList.length === 0) {
    return null
  }

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
          loop={categoriesList.length > 3}
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
          {categoriesList.map((category) => (
            <SwiperSlide key={category.id ?? category.title}>
              <div className="item mb-15">
                <div className="img">
                  <img
                    src={category.image}
                    className="img-fluid"
                    alt={category.title}
                    loading="lazy"
                    data-fallback={category.isFallbackImage ? '1' : undefined}
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallbackApplied) {
                        return
                      }

                      event.currentTarget.dataset.fallbackApplied = '1'
                      event.currentTarget.dataset.fallback = '1'
                      event.currentTarget.src = DEFAULT_CATEGORY_IMAGE
                    }}
                  />
                </div>
                <div className="info">
                  <h2 className="title">{category.title}</h2>
                  {category.subtitle ? <p className="subtitle">{category.subtitle}</p> : null}
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
