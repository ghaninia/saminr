import { useLanguage } from '../../contexts/LanguageContext'
import './RegistrationEvent.css'

function RegistrationEvent() {
  const { t } = useLanguage()

  return (
    <div className="registration-event-page">
      <h1>{t('pages.registrationEvent.title')}</h1>
    </div>
  )
}

export default RegistrationEvent

