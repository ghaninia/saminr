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
          <svg className="loader">
              <g id="loader-3">
                <rect id="bg" fill="none" x="0" y="0" width="80" height="80"></rect>
                <g className="linechart-loader" transform="translate(13.000000, 25.000000)" stroke="#CBCDD2">
                  <polyline className="linechart" points="0.747315209 24.6458138 7.44456625 29.6458138 14.1418173 10.6458138 20.8390683 15.6458138 27.5363194 17.6458138 34.2335704 25.6458138 38.9308215 2.6458138 46.6280725 15.6458138 50.8543411 10.4098828 54.3253236 0.645813797"></polyline>
                </g>
              </g>
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
