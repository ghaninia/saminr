import { useLanguage } from '../../contexts/LanguageContext'
import './Gallery.css'

function Gallery() {
  const { t } = useLanguage()

  return (
    <div className="gallery-page">
      <h1>{t('pages.gallery.title')}</h1>
    </div>
  )
}

export default Gallery

