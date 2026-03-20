import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import './Navigation.css'

function Navigation() {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              <Link 
                to="/" 
                className="nav-logo"
                onClick={closeMenu}
              >
                Samin
              </Link>
            </div>
            {/* Desktop Menu */}
            <div className="nav-menu-desktop">
              <ul className="nav-menu-list">
                <li>
                  <Link to="/" className="nav-link">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="nav-link">
                    {t('nav.events')}
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="nav-link">
                    {t('nav.gallery')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="nav-link">
                    {t('nav.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Actions (Theme & Language) */}
            <div className="nav-actions-desktop">
              <ThemeSwitcher />
              <LanguageSwitcher />
              {/* Contact Info */}
              <div className="navbar-left">
                <div className="wrap">
                  <div className="icon">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text">
                    <p>{t('nav.needHelp')}</p>
                    <h5>
                      <a href="tel:8551004444">855 100 4444</a>
                    </h5>
                  </div>
                </div>
              </div>

            </div>

            {/* Mobile Menu Button */}
            <div className="nav-mobile-header">
              <div className="nav-actions-mobile">
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
                <Link to="/" className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="nav-mobile-link" onClick={closeMenu}>
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="nav-mobile-link" onClick={closeMenu}>
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

