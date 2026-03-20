import { useLanguage } from '../../../../contexts/LanguageContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import './SectionComponents.css'

function ProcessSection({ steps = [] }) {
  const { t } = useLanguage()
  const { theme } = useTheme()

  const defaultSteps = [
    {
      number: '01.',
      title: t('process.step1.title'),
      description: t('process.step1.description')
    },
    {
      number: '02.',
      title: t('process.step2.title'),
      description: t('process.step2.description')
    },
    {
      number: '03.',
      title: t('process.step3.title'),
      description: t('process.step3.description')
    }
  ]

  const processSteps = steps.length > 0 ? steps : defaultSteps

  return (
    <section className={`process section-padding`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h6 className="section-subtitle">{t('process.subtitle')}</h6>
          <h1 className="section-title">{t('process.titleSpan')}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {processSteps.map((step, index) => (
            <div key={index} className="item">
              <div className="text">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
              <div className="numb">
                <div className="numb-curv">
                  <div className="number">{step.number}</div>
                  <div className="shap-left-top">
                    <svg className="w-11 h-11" fill="none" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z" ></path>
                    </svg>
                  </div>
                  <div className="shap-right-bottom">
                    <svg className="w-11 h-11" fill="none" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 1.54972e-06L0 0L2.38419e-07 11C1.65973e-07 4.92487 4.92487 1.62217e-06 11 1.54972e-06Z" ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProcessSection