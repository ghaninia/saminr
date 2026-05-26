import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useSettings } from '../contexts/SettingsContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCart } from '../contexts/CartContext'
import { removeWhitespace } from '../utils/index'
import { DEFAULTS, ROUTES, LOCALES } from '../constants/index'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import './Navigation.css'

function Navigation() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  const { theme } = useTheme()
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navTitle = getSetting('title', { fallback: DEFAULTS.PHONE })
  const phone = getSetting('phone', { fallback: DEFAULTS.PHONE })
  const phoneHref = `tel:${removeWhitespace(String(phone))}`

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navigation-wrapper">
      <div className={`navigation background ${theme === 'light' ? 'light-theme' : ''}`}>
        <div className="navigation-container">
          <div className="navigation-content">
            {/* Logo */}
            <div className="nav-logo-wrapper">
              <Link to={ROUTES.HOME} className="nav-logo" onClick={closeMenu}>
                {navTitle}
              </Link>
            </div>
            {/* Desktop Menu */}
            <div className="nav-menu-desktop">
              <ul className="nav-menu-list">
                <li>
                  <Link to={ROUTES.HOME} className="nav-link">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.EVENTS} className="nav-link">
                    {t('nav.events')}
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.GALLERY} className="nav-link">
                    {t('nav.gallery')}
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.CONTACT} className="nav-link">
                    {t('nav.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Actions (Theme & Language) */}
            <div className="nav-actions-desktop">
              <Link to={ROUTES.CART} className="nav-cart-btn" title={t('cart.title')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {totalItems > 0 && (
                  <span className="nav-cart-badge">{totalItems}</span>
                )}
              </Link>
              <ThemeSwitcher />
              <LanguageSwitcher />
              {/* Contact Info */}
              <div className="navbar-left">
                <div className="wrap">
                  <div className="icon">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text">
                    <p>{t('nav.needHelp')}</p>
                    <h5>
                      <a href={phoneHref}>{phone}</a>
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="nav-mobile-header">
              <div className="nav-actions-mobile">
                <Link to={ROUTES.CART} className="nav-cart-btn" style={{ marginRight: '8px', marginLeft: '8px' }} onClick={closeMenu} title={t('cart.title')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {totalItems > 0 && (
                    <span className="nav-cart-badge">{totalItems}</span>
                  )}
                </Link>
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
              <button
                onClick={toggleMenu}
                className="nav-hamburger"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <div className="hamburger-icon">
                  <span className={`hamburger-line ${isMenuOpen ? 'open-1' : ''}`} />
                  <span className={`hamburger-line ${isMenuOpen ? 'open-2' : ''}`} />
                  <span className={`hamburger-line ${isMenuOpen ? 'open-3' : ''}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`nav-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-mobile-list">
              <li>
                <Link to={ROUTES.HOME} className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CART} className="nav-mobile-link" onClick={closeMenu}>
                  {t('cart.title')} {totalItems > 0 ? `(${totalItems})` : ''}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.EVENTS} className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.GALLERY} className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

