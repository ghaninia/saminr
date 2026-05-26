import { Mail, MapPin, Clock3, PhoneCall } from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useSettings } from '../../../../contexts/SettingsContext'
import { removeWhitespace } from '../../../../utils/index'

const CARD_STYLES = [
  {
    key: 'email',
    icon: Mail,
  },
  {
    key: 'address',
    icon: MapPin,
  },
  {
    key: 'hours',
    icon: Clock3,
  },
  {
    key: 'phone',
    icon: PhoneCall,
    featured: true,
  },
]

function AboutContactSection() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()

  const email = getSetting('email', {
    fallback: t('aboutContact.items.email.value'),
    localized: false,
  })

  const address = getSetting('address', {
    fallback: t('aboutContact.items.address.value'),
  })

  const openingHours = getSetting('opening_hours', {
    fallback: t('aboutContact.items.hours.value'),
  })

  const phone = getSetting('phone', {
    fallback: t('aboutContact.items.phone.value'),
    localized: false,
  })

  const mobile = getSetting('mobile', {
    fallback: '',
    localized: false,
  })

  const callValue = [phone, mobile].filter(Boolean).join(' - ')
  const callHref = `tel:${removeWhitespace(String(phone || mobile || ''))}`

  const items = {
    email: {
      title: t('aboutContact.items.email.title'),
      value: email,
      href: email ? `mailto:${email}` : null,
    },
    address: {
      title: t('aboutContact.items.address.title'),
      value: address,
      href: null,
    },
    hours: {
      title: t('aboutContact.items.hours.title'),
      value: openingHours,
      href: null,
    },
    phone: {
      title: t('aboutContact.items.phone.title'),
      value: callValue,
      href: callValue ? callHref : null,
    },
  }

  return (
    <div className="contact-box">
      <div className="container">
        <div className="row grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {CARD_STYLES.map(({ key, icon: Icon, featured = false }, index) => {
            const item = items[key]

            return (
              <div
                key={key}
                className="col-lg-3 col-md-6 animate-box fadeInUp animated"
                data-animate-effect="fadeInUp"
              >
                <div className={`item${featured ? ' active' : ''}`}>
                  <span className="icon">
                    <Icon size={32} strokeWidth={1.75} />
                  </span>
                  <h2>{item.title}</h2>
                  <div>
                    {item.href ? (
                      <p>
                        <a href={item.href}>{item.value}</a>
                      </p>
                    ) : (
                      <p>{item.value}</p>
                    )}
                  </div>
                  <Icon className="numb" size={80} strokeWidth={1.75} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AboutContactSection