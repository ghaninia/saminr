import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Instagram, Youtube } from 'lucide-react'
import Candle from './../../../../components/Candle'

function AppSection() {
  const { t } = useLanguage()
  const { theme } = useTheme()

  return (
    <section id="app" data-scroll-index="7" className="app section-padding">
      <div className="container">
        <div className="item">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <h6>{t('app.subtitle')}</h6>
              <h3>{t('app.title')}</h3>
              <p className="mb-30">{t('app.description')}</p>
              <a href="#0" className="button-3 mb-20 mr-10">
                {t('app.instagram')}
                <Instagram className="ml-2" />
              </a>
              <a href="#0" className="button-3 mb-20">
                {t('app.youtube')}
                <Youtube className="ml-2" />
              </a>
            </div>
            <div className="lg:col-span-6">
              <Candle />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppSection