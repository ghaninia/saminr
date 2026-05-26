import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { API_ENDPOINTS } from '../../constants/index'
import './Contact.css'

const INITIAL_FORM = { fullname: '', email: '', content: '' }

function Contact() {
  const { t, language } = useLanguage()
  const isRtl = language === 'fa'

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.fullname.trim()) newErrors.fullname = t('contact.errors.fullnameRequired')
    if (!form.email.trim()) {
      newErrors.email = t('contact.errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = t('contact.errors.emailInvalid')
    }
    if (!form.content.trim()) newErrors.content = t('contact.errors.contentRequired')
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      const res = await fetch(API_ENDPOINTS.CLIENT.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          fullname: form.fullname.trim(),
          email: form.email.trim(),
          content: form.content.trim(),
        }),
      })

      if (!res.ok) {
        let msg = t('contact.errors.serverError')
        try {
          const payload = await res.json()
          if (payload?.message) msg = String(payload.message)
          if (payload?.errors) {
            const fieldErrors = {}
            for (const [field, messages] of Object.entries(payload.errors)) {
              fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages)
            }
            setErrors(fieldErrors)
            return
          }
        } catch {
          // ignore
        }
        setServerError(msg)
        return
      }

      setSuccess(true)
      setForm(INITIAL_FORM)
    } catch {
      setServerError(t('contact.errors.networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="contact-hero">
        <h1 className="contact-title">{t('contact.title')}</h1>
        <p className="contact-subtitle">{t('contact.subtitle')}</p>
      </div>

      <div className="contact-wrapper">
        <div className="contact-card">
          {success ? (
            <div className="contact-success">
              <span className="contact-success-icon">✓</span>
              <p className="contact-success-text">{t('contact.success')}</p>
              <button
                className="contact-btn-reset"
                onClick={() => setSuccess(false)}
              >
                {t('contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-fullname">
                  {t('contact.fields.fullname')}
                </label>
                <input
                  id="contact-fullname"
                  name="fullname"
                  type="text"
                  className={`contact-input${errors.fullname ? ' contact-input--error' : ''}`}
                  placeholder={t('contact.placeholders.fullname')}
                  value={form.fullname}
                  onChange={handleChange}
                  disabled={submitting}
                  autoComplete="name"
                  maxLength={255}
                />
                {errors.fullname && <span className="contact-error">{errors.fullname}</span>}
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-email">
                  {t('contact.fields.email')}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className={`contact-input${errors.email ? ' contact-input--error' : ''}`}
                  placeholder={t('contact.placeholders.email')}
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  autoComplete="email"
                  maxLength={255}
                />
                {errors.email && <span className="contact-error">{errors.email}</span>}
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-content">
                  {t('contact.fields.content')}
                </label>
                <textarea
                  id="contact-content"
                  name="content"
                  className={`contact-textarea${errors.content ? ' contact-input--error' : ''}`}
                  placeholder={t('contact.placeholders.content')}
                  value={form.content}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={6}
                  maxLength={5000}
                />
                {errors.content && <span className="contact-error">{errors.content}</span>}
              </div>

              {serverError && <p className="contact-server-error">{serverError}</p>}

              <button
                type="submit"
                className="contact-btn-submit"
                disabled={submitting}
              >
                {submitting ? t('contact.sending') : t('contact.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact

