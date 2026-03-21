import { useLanguage } from '../../../../contexts/LanguageContext'
import { useSettings } from '../../../../contexts/SettingsContext'
import { Instagram, Youtube, PlayCircle } from 'lucide-react'
import Candle from './../../../../components/Candle'

function AppSection() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()

  const siteDescription = getSetting('description', { fallback: t('app.description') })
  const instagram = getSetting('instagram', { fallback: '#', localized: false })
  const aparat = getSetting('aparat', { fallback: '#', localized: false })
  const youtube = getSetting('youtube', { fallback: '#', localized: false })

  return (
    <section id="app-section" className="app section-padding">
      <div className="container">
        <div className="item">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <h6>{t('app.subtitle')}</h6>
              <h3>{t('app.title')}</h3>
              <p className="mb-30">{siteDescription}</p>
              <a href={instagram} target="_blank" rel="noreferrer" className="button-3 mb-20 mr-10">
                {t('app.instagram')}
                <Instagram className="ml-2" />
              </a>
              <a href={aparat} target="_blank" rel="noreferrer" className="button-3 mb-20 mr-10">
                {t('app.aparat')}
                <PlayCircle className="ml-2" />
              </a>
              <a href={youtube} target="_blank" rel="noreferrer" className="button-3 mb-20">
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
