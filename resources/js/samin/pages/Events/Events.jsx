import { useLanguage } from '../../contexts/LanguageContext'
import './Events.css'

function Events() {
  const { t } = useLanguage()

  return (
    <div className="events-page">
      <h1>{t('pages.events.title')}</h1>
    </div>
  )
}

export default Events

