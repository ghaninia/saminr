import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useSettings } from '../contexts/SettingsContext'
import { apiClient } from '../services/apiClient'
import { removeWhitespace } from '../utils/index'
import { ASSETS, LOCALES, ROUTES } from '../constants/index'
import { Phone, Mail, MapPin, Instagram, Youtube, PlayCircle, ArrowUpRight } from 'lucide-react'
import './Footer.css'

function Footer() {
  const { t, language } = useLanguage()
  const { getSetting } = useSettings()
  const [fullname, setFullname] = useState('')
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribeError, setSubscribeError] = useState('')
  const [subscribeNotice, setSubscribeNotice] = useState('')
  const inputDirection = language === LOCALES.FA ? 'rtl' : 'ltr'

  const phone = getSetting('phone', { fallback: t('footer.contact.phone'), localized: false })
  const mobile = getSetting('mobile', { fallback: null, localized: false })
  const contactNumbers = [phone, mobile].filter(Boolean).join(' - ')
  const supportHref = `tel:${removeWhitespace(String(phone || mobile || ''))}`

  const email = getSetting('email', { fallback: t('footer.email.address'), localized: false })
  const address = getSetting('address', { fallback: t('footer.address.location') })
  const aboutUs = getSetting('aboutus', { fallback: t('footer.about.description') })
  const siteDescription = getSetting('description', { fallback: t('footer.subscribe.description') })
  const instagram = getSetting('instagram', { fallback: '#', localized: false })
  const aparat = getSetting('aparat', { fallback: '#', localized: false })
  const youtube = getSetting('youtube', { fallback: '#', localized: false })
  const copyright = getSetting('copyright', {
    fallback: `${t('footer.copyright.text')} ${t('footer.copyright.designer')}`,
  })

  const onSubscribe = async (event) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setSubscribeError('')
    setSubscribeNotice('')

    try {
      await apiClient.subscribe({
        fullname: fullname.trim(),
        email: subscriberEmail.trim(),
      })

      setSubscribeNotice(t('footer.subscribe.success'))
      setFullname('')
      setSubscriberEmail('')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      const isRateLimited = message.includes('Too Many Attempts') || message.includes('429')
      setSubscribeError(
        isRateLimited ? t('footer.subscribe.rateLimited') : t('footer.subscribe.error')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="footer">
      <div className="container mx-auto px-4">
        {/* first footer */}
        <div className="first-footer py-16">
          <div className="grid grid-cols-1">
            <div className="links dark footer-contact-links">
              <div className="footer-contact-links-wrapper grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="footer-contact-link-wrapper flex items-center">
                  <div className="image-wrapper footer-contact-link-icon">
                    <div className="icon-footer flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="footer-contact-link-content">
                    <h6>{t('footer.contact.title')}</h6>
                    <p>
                      <a href={supportHref}>{contactNumbers || t('footer.contact.phone')}</a>
                    </p>
                  </div>
                </div>
                <div className="footer-contact-links-divider hidden md:block"></div>
                <div className="footer-contact-link-wrapper flex items-center">
                  <div className="image-wrapper footer-contact-link-icon">
                    <div className="icon-footer flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="footer-contact-link-content">
                    <h6>{t('footer.email.title')}</h6>
                    <p>{email}</p>
                  </div>
                </div>
                <div className="footer-contact-links-divider hidden md:block"></div>
                <div className="footer-contact-link-wrapper flex items-center">
                  <div className="image-wrapper footer-contact-link-icon">
                    <div className="icon-footer flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="footer-contact-link-content">
                    <h6>{t('footer.address.title')}</h6>
                    <p>{address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* second footer */}
        <div className="second-footer border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12">
            {/* about & social icons */}
            <div className="md:col-span-4 widget-area">
              <div className="widget">
                <div className="footer-logo mb-4">
                  
                </div>
                <div className="widget-text">
                  <p className="mb-4">{aboutUs}</p>
                  <div className="social-icons">
                    <ul className="flex space-x-2">
                      <li>
                        <a
                          href={aparat}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Aparat"
                          className="flex items-center justify-center w-12 h-12 border border-yellow-500 rounded-full text-white hover:bg-yellow-500 hover:text-black transition"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </a>
                      </li>
                      <li>
                        <a
                          href={instagram}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Instagram"
                          className="flex items-center justify-center w-12 h-12 border border-yellow-500 rounded-full text-white hover:bg-yellow-500 hover:text-black transition"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      </li>
                      <li>
                        <a
                          href={youtube}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="YouTube"
                          className="flex items-center justify-center w-12 h-12 border border-yellow-500 rounded-full text-white hover:bg-yellow-500 hover:text-black transition"
                        >
                          <Youtube className="w-5 h-5" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* quick links */}
            <div className="md:col-span-3 md:col-start-6 widget-area">
              <div className="widget usful-links">
                <h3 className="widget-title mb-4">{t('footer.quickLinks.title')}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to={ROUTES.HOME} className="text-gray-300 hover:text-yellow-500">
                      {t('footer.quickLinks.about')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.CATEGORIES} className="text-gray-300 hover:text-yellow-500">
                      {t('footer.quickLinks.categories')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.CONTACT} className="text-gray-300 hover:text-yellow-500">
                      {t('footer.quickLinks.contact')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* subscribe */}
            <div className="md:col-span-4 widget-area">
              <div className="widget">
                <h3 className="widget-title mb-4">{t('footer.subscribe.title')}</h3>
                <p className="mb-4">{siteDescription}</p>
                <div className="widget-newsletter">
                  <form onSubmit={onSubscribe} className="newsletter-form" noValidate>
                    <div className="newsletter-fields">
                      <input
                        placeholder={t('footer.subscribe.fullnamePlaceholder')}
                        required
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        dir={inputDirection}
                        autoComplete="name"
                        className="newsletter-input"
                      />
                      <input
                        placeholder={t('footer.subscribe.placeholder')}
                        required
                        type="email"
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        dir={inputDirection}
                        autoComplete="email"
                        className="newsletter-input"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="newsletter-submit disabled:opacity-60"
                        aria-label={t('footer.subscribe.title')}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                    {subscribeNotice ? (
                      <div className="text-sm text-green-400">{subscribeNotice}</div>
                    ) : null}
                    {subscribeError ? <div className="text-sm text-red-400">{subscribeError}</div> : null}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* bottom footer */}
        <div className="bottom-footer-text py-10">
          <div className="copyright text-center">
            <p className="text-gray-500 text-sm">{copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
