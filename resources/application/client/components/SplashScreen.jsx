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
          <svg class="loader">
            <g id="loader-1">
              <rect id="bg" fill="transparent" x="0" y="0" width="80" height="80"></rect>
              <g class="candlechart-loader" transform="translate(14.000000, 20.000000)" fill="#CBCDD2">
                <polygon class="candle-4" points="47 6.15384615 47 0 49 0 49 6.15384615 54 6.15384615 54 17.6923077 49 17.6923077 49 24.6153846 47 24.6153846 47 17.6923077 42 17.6923077 42 6.15384615"></polygon>
                <path d="M33,33.8461538 L28,33.8461538 L28,6.15384615 L33,6.15384615 L33,0 L35,0 L35,6.15384615 L40,6.15384615 L40,33.8461538 L35,33.8461538 L35,40 L33,40 L33,33.8461538 Z M30,7.69230769 L30,32.3076923 L38,32.3076923 L38,7.69230769 L30,7.69230769 Z" class="candle-3"></path>
                <polygon class="candle-2" points="19 24.6153846 19 18.4615385 21 18.4615385 21 24.6153846 26 24.6153846 26 33.8461538 21 33.8461538 21 40 19 40 19 33.8461538 14 33.8461538 14 24.6153846"></polygon>
                <path d="M0,24.8461538 L0,16.1538462 L5,16.1538462 L5,10 L7,10 L7,16.1538462 L12,16.1538462 L12,24.8461538 L7,24.8461538 L7,31 L5,31 L5,24.8461538 L0,24.8461538 Z M2,17.6923077 L2,23.3076923 L10,23.3076923 L10,17.6923077 L2,17.6923077 Z" class="candle-1"></path>
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
