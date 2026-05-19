import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useSettings } from '../../../../contexts/SettingsContext'
import { Play, X } from 'lucide-react'
import { useState } from 'react'

function VideoSection() {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const { getSetting } = useSettings()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const videoUrl = getSetting('video_url', { 
    fallback: 'https://www.aparat.com/video/video/embed/videohash/default',
    localized: false 
  })

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <section className="video-wrapper video section-padding bg-img bg-fixed">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <h6 className="section-subtitle">{t('video.subtitle')}</h6>
              <h1 className="section-title white">{t('video.title')} <span> {t('video.titleSpan')} </span></h1>
            </div>
          </div>
          <div className="row">
            <div className="text-center col-md-12">
              <div className="vid" onClick={openModal}>
                <div className="vid-butn">
                  <span className="icon">
                    <Play size={32} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
            <iframe
              src={videoUrl}
              title={t('video.title')}
              className="modal-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoSection