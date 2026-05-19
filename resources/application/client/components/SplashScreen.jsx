import { useGlobalLoading } from '../contexts/LoadingContext'
import { useTheme } from '../contexts/ThemeContext'
import './SplashScreen.css'

/**
 * SplashScreen - Global loading indicator
 * Shows during app/data loading and automatically hides when done
 */
export default function SplashScreen() {
  const { isLoading, progress } = useGlobalLoading()
  const { theme } = useTheme()

  if (!isLoading) {
    return null
  }

  return (
    <div className={`splash-screen splash-screen--${theme}`}>
      <div className="splash-screen__content">
        {/* Animated Logo */}
        <div className="splash-screen__logo">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="splash-screen__logo-icon"
          >
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <circle cx="40" cy="40" r="25" fill="currentColor" opacity="0.8" />
            <circle cx="40" cy="15" r="3" fill="white" />
            <circle cx="40" cy="65" r="3" fill="white" opacity="0.6" />
          </svg>
        </div>

        {/* Loading Text */}
        <div className="splash-screen__text">
          <div className="splash-screen__spinner">
            <span className="splash-screen__dot splash-screen__dot--1" />
            <span className="splash-screen__dot splash-screen__dot--2" />
            <span className="splash-screen__dot splash-screen__dot--3" />
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="splash-screen__progress-container">
            <div
              className="splash-screen__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
