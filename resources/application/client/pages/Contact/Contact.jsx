import { useLanguage } from '../../contexts/LanguageContext'
import './Contact.css'

function Contact() {
  const { t } = useLanguage()

  return (
    <div className="contact-page">
      <h1>{t('pages.contact.title')}</h1>
    </div>
  )
}

export default Contact

