import { useLanguage } from '../../contexts/LanguageContext'
import './GetTicket.css'

function GetTicket() {
  const { t } = useLanguage()

  return (
    <div className="get-ticket-page">
      <h1>{t('pages.getTicket.title')}</h1>
    </div>
  )
}

export default GetTicket

