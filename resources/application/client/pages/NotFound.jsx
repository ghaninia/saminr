import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { ROUTES } from '../constants/index'
import { AlertCircle } from 'lucide-react'
import './NotFound.css'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <>
      <section className="page_404">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 ">
              <div className="col-sm-10 col-sm-offset-1  text-center">
                <div className="four_zero_four_bg">
                  <h1 className="text-center ">{t('notFound.title')}</h1>
                </div>
                <div className="contant_box_404">
                  <h3 className="h2">
                    {t('notFound.description')}
                  </h3>
                  <Link
                    to={ROUTES.HOME}
                    className="not-found-button"
                  >
                    {t('notFound.goHome')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
