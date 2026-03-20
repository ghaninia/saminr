import { useLanguage } from '../contexts/LanguageContext'
import { Phone, Mail, MapPin, Facebook, Youtube, MessageCircle, ArrowUpRight } from 'lucide-react'
import './Footer.css'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="footer">
      <div className="container mx-auto px-4">
        {/* first footer */}
        <div className="first-footer py-16">
          <div className="grid grid-cols-1">
            <div className="links dark footer-contact-links">
              <div className="footer-contact-links-wrapper grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="footer-contact-link-wrapper flex items-center">
                  <div className="image-wrapper footer-contact-link-icon mr-4">
                    <div className="icon-footer flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="footer-contact-link-content">
                    <h6>{t('footer.contact.title')}</h6>
                    <p>{t('footer.contact.phone')}</p>
                  </div>
                </div>
                <div className="footer-contact-links-divider hidden md:block"></div>
                <div className="footer-contact-link-wrapper flex items-center">
                  <div className="image-wrapper footer-contact-link-icon mr-4">
                    <div className="icon-footer flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="footer-contact-link-content">
                    <h6>{t('footer.email.title')}</h6>
                    <p>{t('footer.email.address')}</p>
                  </div>
                </div>
                <div className="footer-contact-links-divider hidden md:block"></div>
                <div className="footer-contact-link-wrapper flex items-center">
                  <div className="image-wrapper footer-contact-link-icon mr-4">
                    <div className="icon-footer flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="footer-contact-link-content">
                    <h6>{t('footer.address.title')}</h6>
                    <p>{t('footer.address.location')}</p>
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
                  <img alt="" src="img/logo-light.png" />
                </div>
                <div className="widget-text">
                  <p className="mb-4">{t('footer.about.description')}</p>
                  <div className="social-icons">
                    <ul className="flex space-x-2">
                      <li>
                        <a href="#" className="flex items-center justify-center w-12 h-12 border border-yellow-500 rounded-full text-white hover:bg-yellow-500 hover:text-black transition">
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center justify-center w-12 h-12 border border-yellow-500 rounded-full text-white hover:bg-yellow-500 hover:text-black transition">
                          <Facebook className="w-5 h-5" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center justify-center w-12 h-12 border border-yellow-500 rounded-full text-white hover:bg-yellow-500 hover:text-black transition">
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
                  <li><a href="about.html" className="text-gray-300 hover:text-yellow-500">{t('footer.quickLinks.about')}</a></li>
                  <li><a href="cars.html" className="text-gray-300 hover:text-yellow-500">{t('footer.quickLinks.cars')}</a></li>
                  <li><a href="car-types.html" className="text-gray-300 hover:text-yellow-500">{t('footer.quickLinks.carTypes')}</a></li>
                  <li><a href="team.html" className="text-gray-300 hover:text-yellow-500">{t('footer.quickLinks.team')}</a></li>
                  <li><a href="contact.html" className="text-gray-300 hover:text-yellow-500">{t('footer.quickLinks.contact')}</a></li>
                </ul>
              </div>
            </div>
            {/* subscribe */}
            <div className="md:col-span-4 widget-area">
              <div className="widget">
                <h3 className="widget-title mb-4">{t('footer.subscribe.title')}</h3>
                <p className="mb-4">{t('footer.subscribe.description')}</p>
                <div className="widget-newsletter">
                  <form action="#" className="flex">
                    <input placeholder={t('footer.subscribe.placeholder')} required type="email" className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-l" />
                    <button type="submit" className="px-4 py-2 bg-yellow-500 text-black rounded-r hover:bg-yellow-600 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* bottom footer */}
        <div className="bottom-footer-text py-10">
          <div className="copyright text-center">
            <p className="text-gray-500 text-sm">
              {t('footer.copyright.text')} <a href="#" className="text-white hover:text-yellow-500" target="_blank">{t('footer.copyright.designer')}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer