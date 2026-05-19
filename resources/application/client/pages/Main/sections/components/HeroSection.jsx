import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useSettings } from '../../../../contexts/SettingsContext'
import { DEFAULTS } from '../../../../constants/index'
import './SectionComponents.css'

const SLOGAN_POSITIONS = [
  'pos-top-left',
  'pos-top-right',
  'pos-bottom-left',
  'pos-bottom-right',
  'pos-middle-left',
  'pos-middle-right'
]

const SLOGAN_ANIMATIONS = [
  'anim-fade-up',
  'anim-fade-down',
  'anim-zoom-in',
  'anim-slide-left',
  'anim-slide-right',
  'anim-rotate-in'
]

function HeroSection() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  const [currentSlogan, setCurrentSlogan] = useState(null)

  const allSlogans = useMemo(() => {
    const fromSettings = getSetting('slogan')
    if (Array.isArray(fromSettings) && fromSettings.length > 0) {
      return fromSettings
    }

    const slogansFromList = t('hero.slogans')
    if (Array.isArray(slogansFromList) && slogansFromList.length > 0) {
      return slogansFromList
    }

    const sliderObj = t('hero.slider')
    if (sliderObj && typeof sliderObj === 'object') {
      return Object.values(sliderObj)
    }

    return []
  }, [getSetting, t])

  useEffect(() => {
    if (!allSlogans.length) return

    const pickRandomSlogan = () => {
      const slogan =
        allSlogans[Math.floor(Math.random() * allSlogans.length)]
      const position =
        SLOGAN_POSITIONS[Math.floor(Math.random() * SLOGAN_POSITIONS.length)]
      const animation =
        SLOGAN_ANIMATIONS[Math.floor(Math.random() * SLOGAN_ANIMATIONS.length)]

      setCurrentSlogan({
        id: Date.now(),
        text: slogan,
        positionClass: position,
        animationClass: animation
      })
    }

    pickRandomSlogan()

    const interval = setInterval(pickRandomSlogan, DEFAULTS.HERO_SLOGAN_INTERVAL)
    return () => clearInterval(interval)
  }, [allSlogans])

  return (
    <div className="hero-section">
      <div className="wrapper">
        <div className="candles">
          <div className="light__wave"></div>
          <div className="candle1">
            <div className="candle1__body">
              <div className="candle1__eyes">
                <span className="candle1__eyes-one"></span>
                <span className="candle1__eyes-two"></span>
              </div>
              <div className="candle1__mouth"></div>
            </div>
            <div className="candle1__stick"></div>
          </div>

          <div className="candle2">
            <div className="candle2__body">
              <div className="candle2__eyes">
                <div className="candle2__eyes-one"></div>
                <div className="candle2__eyes-two"></div>
              </div>
            </div>
            <div className="candle2__stick"></div>
          </div>

          <div className="candle2__fire"></div>
          <div className="sparkles-one"></div>
          <div className="sparkles-two"></div>
          <div className="candle__smoke-one"></div>
          <div className="candle__smoke-two"></div>
        </div>
        <div className="floor"></div>
      </div>

      {currentSlogan && (
        <div className="hero-slogans">
          <div
            key={currentSlogan.id}
            className={`hero-slogan ${currentSlogan.positionClass} ${currentSlogan.animationClass}`}
          >
            {currentSlogan.text}
            <div className="bubble-circle circle-1"></div>
            <div className="bubble-circle circle-2"></div>
            <div className="bubble-circle circle-3"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeroSection
