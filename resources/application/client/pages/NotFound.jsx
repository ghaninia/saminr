import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { ROUTES } from '../constants/index'
import { AlertCircle } from 'lucide-react'

/**
 * NotFound - 404 Page
 * Displays when a route is not found
 */
export default function NotFound() {
  const { t } = useLanguage()

  return (
    <section className="not-found-page">
      <div className="container mx-auto px-4 py-20">
        <div className="not-found-content text-center">
          {/* Icon */}
          <div className="not-found-icon mb-8">
            <AlertCircle size={80} className="mx-auto text-amber-500 opacity-75" />
          </div>

          {/* Status Code */}
          <h1 className="not-found-code mb-4 text-6xl font-bold text-gray-400">
            404
          </h1>

          {/* Title */}
          <h2 className="not-found-title mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t('notFound.title')}
          </h2>

          {/* Description */}
          <p className="not-found-description mb-8 max-w-md mx-auto text-gray-600 dark:text-gray-400">
            {t('notFound.description')}
          </p>

          {/* CTA Button */}
          <Link
            to={ROUTES.HOME}
            className="not-found-button inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-medium text-white transition-all hover:bg-amber-600 active:scale-95"
          >
            {t('notFound.goHome')}
          </Link>

          {/* Optional secondary link */}
          <div className="not-found-links mt-12 flex flex-col gap-4 sm:flex-row justify-center sm:gap-8">
            <Link to={ROUTES.PRODUCTS} className="text-amber-500 hover:underline">
              {t('notFound.browseCatalog')}
            </Link>
            <Link to={ROUTES.CONTACT} className="text-amber-500 hover:underline">
              {t('notFound.contactSupport')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
