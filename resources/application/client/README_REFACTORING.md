# Client Refactoring - Quick Reference Guide

## 📖 Documentation Files

Read these in order for complete understanding:

1. **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Start here! High-level overview of all improvements
2. **[CHANGELOG.md](./CHANGELOG.md)** - Detailed file-by-file changes
3. **[REFACTORING.md](./REFACTORING.md)** - Complete refactoring guide with examples

---

## 🚀 Quick Start for Developers

### Using Constants
```javascript
import { ROUTES, ASSETS, DEFAULTS, STORAGE_KEYS, LOCALES } from './constants/index'

// Use routes
<Link to={ROUTES.HOME} />
<Link to={ROUTES.PRODUCT_DETAIL} />

// Use assets
<img src={ASSETS.IMAGES.NOT_FOUND} />

// Use defaults
const price = DEFAULTS.PHONE
const lang = DEFAULTS.LANGUAGE
const theme = DEFAULTS.THEME

// Use storage keys
localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'fa')

// Use locales
if (language === LOCALES.FA) { /* RTL logic */ }
```

### Using Utilities
```javascript
import {
  formatPrice,
  resolveLocalizedText,
  sanitizeSvg,
  removeWhitespace,
  normalizeArrayResponse,
  getDirection,
} from './utils/index'

// Format price
const formatted = formatPrice(1000, 'fa')  // 1,000 تومان

// Resolve localized text
const text = resolveLocalizedText(data.title, 'en')  // English text

// Sanitize SVG
const svg = sanitizeSvg(dangerousHtml)

// Remove whitespace
const phone = removeWhitespace('0555 100 4444')  // 05551004444

// Normalize API response
const items = normalizeArrayResponse(apiResponse)

// Get text direction
const dir = getDirection('fa')  // 'rtl'
```

### Using API Service
```javascript
import { apiClient } from './services/apiClient'

// Get settings
const settings = await apiClient.getClientSettings()

// Get products
const products = await apiClient.getClientProducts()

// Get single product
const product = await apiClient.getClientProduct('product-slug')

// Get reviews
const reviews = await apiClient.getClientReviews({ lang: 'fa' })

// Subscribe
await apiClient.subscribe({
  fullname: 'John Doe',
  email: 'john@example.com'
})
```

### Using Custom Hooks
```javascript
import {
  useAsyncData,
  useToggle,
  useLocalStorage,
  useDebounce,
  useWindowSize,
} from './hooks/index'

// Async data fetching
const { data, loading, error, refetch } = useAsyncData(
  () => apiClient.getClientProducts(),
  [],
  []
)

// Toggle boolean state
const [isOpen, toggle, setTrue, setFalse] = useToggle(false)

// LocalStorage sync
const [theme, setTheme] = useLocalStorage('theme', 'dark')

// Debounce value
const debouncedSearch = useDebounce(searchTerm, 300)

// Track window size
const { width, height } = useWindowSize()
```

---

## 📁 New Folder Structure

```
client/
├── constants/
│   └── index.js              ⭐ Configuration (110 lines)
├── services/
│   └── apiClient.js          ⭐ API layer (140 lines)
├── utils/
│   └── index.js              ⭐ Utilities (210 lines)
├── hooks/
│   └── index.js              ⭐ Custom hooks (190 lines)
├── types/
│   └── index.js              ⭐ Type definitions (85 lines)
├── contexts/
│   ├── LanguageContext.jsx   ✅ Refactored
│   ├── ThemeContext.jsx      ✅ Refactored
│   └── SettingsContext.jsx   ✅ Refactored
├── components/
│   ├── Navigation.jsx        ✅ Refactored
│   ├── Footer.jsx            ✅ Refactored
│   └── ...
├── pages/
│   ├── Main/
│   │   └── sections/components/
│   │       ├── ProductsSection.jsx      ✅ Refactored
│   │       └── TestimonialsSection.jsx  ✅ Refactored
│   ├── Product/
│   │   └── ProductDetails.jsx           ✅ Refactored
│   └── ...
├── translations/
├── REFACTORING.md            📚 Complete guide
├── IMPROVEMENTS.md           📈 Impact summary
├── CHANGELOG.md              📋 Detailed changes
└── ...
```

---

## 🎯 Key Constants

### Routes
```javascript
ROUTES.HOME                    // '/'
ROUTES.PRODUCTS                // '/products'
ROUTES.PRODUCT_DETAIL          // '/products/:shortLink'
ROUTES.CONTACT                 // '/contact'
ROUTES.GALLERY                 // '/gallery'
ROUTES.EVENTS                  // '/events'
ROUTES.REGISTRATION_EVENT      // '/registration-event'
ROUTES.GET_TICKET              // '/get-ticket'
```

### Assets
```javascript
ASSETS.IMAGES.NOT_FOUND        // '/images/file-corrupted.svg'
ASSETS.IMAGES.LOGO_LIGHT       // '/img/logo-light.png'
ASSETS.IMAGES.CORRUPTED        // '/images/file-corrupted.svg'
```

### Storage Keys
```javascript
STORAGE_KEYS.LANGUAGE          // 'language'
STORAGE_KEYS.THEME             // 'theme'
STORAGE_KEYS.SETTINGS_CACHE    // 'client_settings_cache'
```

### Defaults
```javascript
DEFAULTS.LANGUAGE              // 'fa'
DEFAULTS.THEME                 // 'dark'
DEFAULTS.PHONE                 // '8551004444'
DEFAULTS.STAR_RATING           // 5
DEFAULTS.DIR.FA                // 'rtl'
DEFAULTS.DIR.EN                // 'ltr'
```

### Locales
```javascript
LOCALES.FA                      // 'fa'
LOCALES.EN                      // 'en'
```

---

## 🔧 Utility Functions

### Data Transformation
```javascript
resolveLocalizedText(value, locale)           // Resolve localized strings
resolveLocalizedValue(value, valueI18n, locale)  // Resolve with fallback
formatPrice(price, language)                  // Format prices per locale
sanitizeSvg(svg)                              // Sanitize SVG strings
```

### API Normalization
```javascript
normalizeArrayResponse(payload)               // Normalize array responses
normalizeObjectResponse(payload)              // Normalize object responses
```

### Helpers
```javascript
isLocalizedObject(value)                      // Check if localized
resolveLocalizedNested(value, locale)         // Recursively resolve
getValueByPath(source, path)                  // Get nested values
clampIndex(index, length)                     // Clamp array index
getDirection(language)                        // Get text direction
removeWhitespace(str)                         // Remove spaces
safeJsonParse(json, fallback)                 // Safe JSON parse
safeJsonStringify(value, fallback)            // Safe JSON stringify
safeEncodeURIComponent(str)                   // Safe URI encode
```

---

## 🎣 Custom Hooks

### useAsyncData
```javascript
const { data, loading, error, refetch } = useAsyncData(
  async () => await fetchData(),
  [dependencies],
  initialValue
)
```

### useToggle
```javascript
const [isOpen, toggle, setTrue, setFalse] = useToggle(false)

// Use:
toggle()      // Toggles boolean
setTrue()     // Sets to true
setFalse()    // Sets to false
```

### useLocalStorage
```javascript
const [value, setValue] = useLocalStorage('key', 'defaultValue')

// Use:
setValue(newValue)  // Auto-saves to localStorage
```

### useDebounce
```javascript
const debouncedValue = useDebounce(value, 300)  // 300ms delay
```

### usePrevious
```javascript
const previousValue = usePrevious(currentValue)
```

### useIsMounted
```javascript
const isMounted = useIsMounted()
if (!isMounted) return  // Prevent memory leaks
```

### useWindowSize
```javascript
const { width, height } = useWindowSize()
```

### useIntersectionObserver
```javascript
const isVisible = useIntersectionObserver(ref, { threshold: 0.1 })
```

---

## 📚 Type Definitions

All types are JSDoc definitions in `types/index.js`:

```javascript
/**
 * @typedef {Object} Product
 * @property {number} [id]
 * @property {string|LocalizedString} [title]
 * @property {ProductVariant[]} [variants]
 * @property {string} [image]
 */

// And 10+ more types...
```

Use in JSDoc comments for better IDE support:

```javascript
/**
 * @param {Product} product
 * @returns {string}
 */
function getProductTitle(product) { ... }
```

---

## 🔄 Migration Checklist

If migrating existing code:

- [ ] Replace hardcoded routes with `ROUTES.*`
- [ ] Replace hardcoded assets with `ASSETS.*`
- [ ] Replace hardcoded defaults with `DEFAULTS.*`
- [ ] Replace inline utility functions with imports from `utils/index`
- [ ] Replace manual fetch calls with `apiClient.*`
- [ ] Add type definitions where appropriate
- [ ] Remove duplicate utility functions
- [ ] Test to ensure no regressions

---

## ❌ What NOT to Do

❌ **DON'T:** Define constants in components
```javascript
// ❌ Don't do this
const DEFAULT_IMAGE = '/images/file-corrupted.svg'

// ✅ Do this instead
import { ASSETS } from '../constants/index'
const image = ASSETS.IMAGES.NOT_FOUND
```

❌ **DON'T:** Duplicate utility functions
```javascript
// ❌ Don't do this in multiple files
function formatPrice(price, lang) { ... }

// ✅ Import from utils
import { formatPrice } from '../utils/index'
```

❌ **DON'T:** Use magic strings for localStorage
```javascript
// ❌ Don't do this
localStorage.getItem('language')
localStorage.setItem('theme', 'dark')

// ✅ Use constants
import { STORAGE_KEYS } from '../constants/index'
localStorage.getItem(STORAGE_KEYS.LANGUAGE)
localStorage.setItem(STORAGE_KEYS.THEME, 'dark')
```

❌ **DON'T:** Inline API calls without abstraction
```javascript
// ❌ Don't do this
fetch('/api/client/products').then(...)

// ✅ Use API service
import { apiClient } from '../services/apiClient'
apiClient.getClientProducts()
```

---

## ✅ Best Practices

✅ **DO:** Import from specialized modules
```javascript
// Great!
import { ROUTES } from '../constants/index'
import { formatPrice } from '../utils/index'
import { useAsyncData } from '../hooks/index'
import { apiClient } from '../services/apiClient'
```

✅ **DO:** Use constants for all configuration
```javascript
// Great!
<Link to={ROUTES.HOME} />
<img src={ASSETS.IMAGES.NOT_FOUND} />
const price = formatPrice(1000, LOCALES.FA)
```

✅ **DO:** Extract repeated logic to utilities
```javascript
// If you use it twice, extract it!
// utils/myHelper.js
export function myHelper() { ... }

// Then import and use everywhere
import { myHelper } from '../utils/index'
```

✅ **DO:** Use custom hooks for complex state logic
```javascript
// Great!
const { data, loading, error } = useAsyncData(...)

// Instead of:
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
// ... 50 lines of effect logic
```

---

## 🚨 Common Pitfalls

### 1. Not Using Constants
```javascript
// ❌ Wrong
const logo = 'img/logo-light.png'

// ✅ Right
import { ASSETS } from '../constants'
const logo = ASSETS.IMAGES.LOGO_LIGHT
```

### 2. Importing from apis.js instead of services
```javascript
// ❌ Old way (still works but not ideal)
import { apiClient } from '../apis'

// ✅ New way
import { apiClient } from '../services/apiClient'
```

### 3. Defining utilities locally
```javascript
// ❌ Wrong - in component
function formatPrice(price, lang) { ... }

// ✅ Right - import from utils
import { formatPrice } from '../utils'
```

### 4. Not using custom hooks
```javascript
// ❌ Wrong - manual state management
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
useEffect(() => {
  let isMounted = true
  fetchData().then(d => { if (isMounted) setData(d) })
  return () => { isMounted = false }
}, [])

// ✅ Right - use hook
const { data, loading } = useAsyncData(fetchData, [])
```

---

## 📖 File Descriptions

| File | Purpose |
|------|---------|
| `constants/index.js` | All hardcoded values & configuration |
| `services/apiClient.js` | HTTP requests & API methods |
| `utils/index.js` | Pure utility functions |
| `hooks/index.js` | Reusable React hooks |
| `types/index.js` | JSDoc type definitions |
| `apis.js` | Backward compatibility wrapper |

---

## 🆘 Need Help?

**Question:** Where do I put my API endpoint?  
**Answer:** Add to `API_ENDPOINTS` in `constants/index.js`, then add method to `apiClient` in `services/apiClient.js`

**Question:** Where do I put my route?  
**Answer:** Add to `ROUTES` in `constants/index.js`

**Question:** Where do I put my utility function?  
**Answer:** Add to `utils/index.js`

**Question:** Where do I put my custom hook?  
**Answer:** Add to `hooks/index.js`

**Question:** Where do I put a default value?  
**Answer:** Add to `DEFAULTS` in `constants/index.js`

---

## 📞 Quick Links

- 📚 [Complete Refactoring Guide](./REFACTORING.md)
- 📈 [Detailed Improvements](./IMPROVEMENTS.md)
- 📋 [Changelog with Examples](./CHANGELOG.md)
- 🔧 [API Documentation](./services/apiClient.js)
- ⚙️ [Constants Documentation](./constants/index.js)
- 🛠️ [Utilities Documentation](./utils/index.js)

---

**Last Updated:** May 19, 2026  
**Status:** ✅ Production Ready  
**Backward Compatibility:** ✅ 100% Maintained
