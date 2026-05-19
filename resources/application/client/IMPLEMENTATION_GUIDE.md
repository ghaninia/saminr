# Implementation Guide - Using Refactored Modules

## Quick Start

### For Fixing the Swiper Bug

If you see carousels showing only 1 item, the fix is already applied in `constants/index.js`:

```javascript
// ✅ NOW CORRECT (camelCase properties)
export const SWIPER_CONFIG = {
  PRODUCTS: {
    spaceBetween: 30,           // ✅ Correct
    slidesPerView: 1,           // ✅ Correct
    slidesPerGroup: 1,          // ✅ Correct
    breakpoints: {
      [SWIPER_BREAKPOINTS.TABLET]: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 30,
      },
      [SWIPER_BREAKPOINTS.DESKTOP]: {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 30,
      },
    },
  },
}
```

Result: Carousels now show responsive items again ✅

---

## Module Usage Guide

### 1. Constants Module

```javascript
import { 
  ROUTES, 
  ASSETS, 
  DEFAULTS, 
  API_ENDPOINTS, 
  STORAGE_KEYS, 
  LOCALES,
  SWIPER_CONFIG 
} from '../constants/index'

// Using Routes
<Link to={ROUTES.HOME} />
<Link to={ROUTES.PRODUCT_DETAIL} />

// Using Assets
<img src={ASSETS.IMAGES.NOT_FOUND} alt="..." />

// Using Defaults
const phone = DEFAULTS.PHONE
const language = DEFAULTS.LANGUAGE
const theme = DEFAULTS.THEME

// Using Storage Keys
localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'fa')
localStorage.getItem(STORAGE_KEYS.THEME)

// Using Locales
if (language === LOCALES.FA) {
  // RTL logic
}

// Using Swiper Config
<Swiper
  {...SWIPER_CONFIG.PRODUCTS}
  loop={true}
  pagination={{ clickable: true }}
>
  {/* slides */}
</Swiper>
```

**When to use:** For ANY hardcoded value - routes, images, storage keys, default values, etc.

---

### 2. API Service Layer

```javascript
import { apiClient } from '../services/apiClient'

// Get all settings
const settings = await apiClient.getClientSettings()

// Get all categories
const categories = await apiClient.getClientCategories()

// Get all products
const products = await apiClient.getClientProducts()

// Get single product
const product = await apiClient.getClientProduct('product-slug')

// Get reviews
const reviews = await apiClient.getClientReviews({ lang: 'fa' })

// Subscribe user
await apiClient.subscribe({
  fullname: 'John Doe',
  email: 'john@example.com'
})

// Error handling
try {
  const data = await apiClient.getClientProducts()
  // Handle data
} catch (error) {
  console.error(error.message)  // Error message is set by apiClient
}
```

**When to use:** For ANY API call - use this instead of direct fetch()

**Benefits:**
- ✅ Unified error handling
- ✅ Consistent request/response format
- ✅ Easy to add interceptors/logging
- ✅ Single place to update base URL

---

### 3. Utilities Module

```javascript
import {
  formatPrice,
  resolveLocalizedText,
  sanitizeSvg,
  removeWhitespace,
  normalizeArrayResponse,
  getDirection,
  safeJsonParse,
  getValueByPath
} from '../utils/index'

// Format prices per locale
const price = formatPrice(1000, 'fa')  // '1,000 تومان'

// Resolve localized strings
const title = resolveLocalizedText(product.title, 'en')

// Sanitize SVG strings
const safeSvg = sanitizeSvg(dangerousHtml)

// Remove whitespace (for phone numbers)
const phone = removeWhitespace('09551004444')  // '09551004444'

// Normalize API responses
const items = normalizeArrayResponse(apiResponse)

// Get text direction
const dir = getDirection('fa')  // 'rtl'

// Safe JSON parsing
const data = safeJsonParse(jsonString, {})

// Get nested object values
const value = getValueByPath(obj, 'nested.key.path')
```

**When to use:** For ANY reusable logic - don't write it twice!

---

### 4. Custom Hooks

```javascript
import {
  useAsyncData,
  useToggle,
  useLocalStorage,
  useDebounce,
  useWindowSize,
  usePrevious,
  useIsMounted,
  useIntersectionObserver
} from '../hooks/index'

// Async data fetching
const { data, loading, error, refetch } = useAsyncData(
  () => apiClient.getClientProducts(),
  [],  // dependencies
  []   // initial value
)

// Boolean toggle
const [isOpen, toggle, setTrue, setFalse] = useToggle(false)
if (isOpen) { /* show menu */ }
toggle()  // toggles to false
setTrue()  // sets to true
setFalse() // sets to false

// localStorage sync
const [theme, setTheme] = useLocalStorage('theme', 'dark')
setTheme('light')  // automatically saves to localStorage

// Debounce values
const debouncedSearch = useDebounce(searchTerm, 300)

// Track window size
const { width, height } = useWindowSize()
if (width < 768) { /* mobile layout */ }

// Get previous value
const previousValue = usePrevious(currentValue)

// Track mount status
const isMounted = useIsMounted()
if (!isMounted) return  // prevent memory leaks

// Track element visibility
const isVisible = useIntersectionObserver(ref, { threshold: 0.1 })
```

**When to use:** For repeated patterns - replace useState + useEffect with these hooks!

---

### 5. Translation System

```javascript
import { useLanguage } from '../contexts/LanguageContext'

function MyComponent() {
  const { t, language } = useLanguage()
  
  return (
    <div>
      {/* Use t() for any user-facing text */}
      <h1>{t('products.title')}</h1>
      <button>{t('common.close')}</button>
      <p>{t('errors.notFound')}</p>
      <span>{t('validation.required')}</span>
      
      {/* Get current language */}
      <p>Current: {language}</p>
    </div>
  )
}
```

**Translation Structure:**
```json
{
  "nav": { "home": "Home", "events": "Events" },
  "products": { "title": "Products", "price": "Price" },
  "common": { "loadMore": "Load More", "close": "Close" },
  "errors": { "notFound": "Not found", "required": "Required" },
  "validation": { "email": "Invalid email", "phone": "Invalid phone" }
}
```

**When to use:** For ANY user-facing text - NEVER hardcode strings!

---

### 6. Type Definitions

```javascript
// Use JSDoc for type hints in your IDE
/**
 * @param {Product} product
 * @param {string} language
 * @returns {string}
 */
function getProductTitle(product, language) {
  return resolveLocalizedText(product.title, language)
}

/**
 * @type {Product}
 */
const product = {
  id: 1,
  title: { fa: 'عنوان', en: 'Title' },
  price: 1000,
  variants: [{ id: 1, price: 1000 }]
}
```

**Available Types:**
```javascript
LocalizedString    // { fa: string, en: string }
Product           // Full product data
ProductVariant    // Variant data
ProductColor      // Color data
Review            // Review/testimonial data
Setting           // Settings data
ApiResponse       // API response wrapper
```

---

## Common Scenarios

### Scenario 1: Adding a New Translation

**Steps:**
1. Open `translations/en.json`
2. Add key under appropriate section:
```json
{
  "products": {
    "addToWishlist": "Add to Wishlist",
    "removeFromWishlist": "Remove from Wishlist"
  }
}
```
3. Add same key to `translations/fa.json` with Farsi translation:
```json
{
  "products": {
    "addToWishlist": "اضافه کردن به لیست علاقه‌مندی",
    "removeFromWishlist": "حذف از لیست علاقه‌مندی"
  }
}
```
4. Use in component:
```javascript
const { t } = useLanguage()
<button>{t('products.addToWishlist')}</button>
```

---

### Scenario 2: Adding a New Constant

**Steps:**
1. Open `constants/index.js`
2. Add to appropriate section:
```javascript
export const ROUTES = {
  HOME: '/',
  WISHLIST: '/wishlist',  // Add here
  // ...
}

// OR
export const DEFAULTS = {
  PAGE_SIZE: 20,
  WISHLIST_LIMIT: 100,  // Add here
  // ...
}
```
3. Use in component:
```javascript
import { ROUTES, DEFAULTS } from '../constants/index'

<Link to={ROUTES.WISHLIST} />
const limit = DEFAULTS.WISHLIST_LIMIT
```

---

### Scenario 3: Creating New API Endpoint

**Steps:**
1. Add to `API_ENDPOINTS` in `constants/index.js`:
```javascript
export const API_ENDPOINTS = {
  CLIENT: {
    WISHLIST: '/api/client/wishlist',
    WISHLIST_ITEMS: '/api/client/wishlist-items',
  },
}
```

2. Add method to `apiClient` in `services/apiClient.js`:
```javascript
export const apiClient = {
  // ... existing methods
  getClientWishlist() {
    return httpGet(API_ENDPOINTS.CLIENT.WISHLIST)
  },
  addToWishlist(productId) {
    return httpPost(API_ENDPOINTS.CLIENT.WISHLIST, { productId })
  },
  removeFromWishlist(productId) {
    return httpDelete(`${API_ENDPOINTS.CLIENT.WISHLIST_ITEMS}/${productId}`)
  }
}
```

3. Use in component:
```javascript
import { apiClient } from '../services/apiClient'

const wishlist = await apiClient.getClientWishlist()
await apiClient.addToWishlist(123)
```

---

### Scenario 4: Extracting Repeated Logic

**Problem:** Same logic in 2+ components
```javascript
// ComponentA.jsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
useEffect(() => {
  let mounted = true
  fetchData().then(d => {
    if (mounted) setData(d)
  })
  return () => { mounted = false }
}, [])

// ComponentB.jsx - Same code!
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
// ... same useEffect
```

**Solution:** Create a custom hook in `hooks/index.js` (or add to existing)
```javascript
export function useAsyncData(fetchFn, dependencies = [], initialValue = null) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    fetchFn()
      .then(d => mounted && setData(d))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false))
    
    return () => { mounted = false }
  }, dependencies)
  
  return { data, loading, error }
}
```

**Use in both components:**
```javascript
const { data, loading, error } = useAsyncData(
  () => apiClient.getClientProducts(),
  []
)
```

---

### Scenario 5: Handling Localized Data

**Problem:** Data has both `title` and `title_i18n`
```javascript
// ❌ Wrong - hardcoded language check
const title = language === 'fa' ? data.title : data.title_i18n?.en

// ✅ Correct - use utility
const title = resolveLocalizedText(data.title, language)
```

**In util function:**
```javascript
export function resolveLocalizedText(value, locale) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    return value?.[locale] ?? value?.fa ?? value?.en ?? ''
  }
  return ''
}
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use constants
import { ROUTES, ASSETS } from '../constants/index'
<Link to={ROUTES.HOME} />
<img src={ASSETS.IMAGES.NOT_FOUND} />

// ✅ Use translations
const { t } = useLanguage()
<button>{t('common.close')}</button>

// ✅ Use API service
import { apiClient } from '../services/apiClient'
const data = await apiClient.getClientProducts()

// ✅ Use utilities
import { formatPrice } from '../utils/index'
const price = formatPrice(1000, language)

// ✅ Use custom hooks
const { data, loading } = useAsyncData(fetchFn, [])

// ✅ Use type hints
/**
 * @param {Product} product
 * @returns {string}
 */
function getName(product) { ... }
```

### ❌ DON'T

```javascript
// ❌ Hardcoded routes
<Link to="/" />

// ❌ Hardcoded text
<button>Close</button>

// ❌ Repeated fetch logic
useEffect(() => {
  fetch('/api/products')
    .then(r => r.json())
    .then(d => setData(d))
}, [])

// ❌ Inline utility functions
const formatted = new Intl.NumberFormat('fa-IR').format(1000)

// ❌ Repeated state logic
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
// ... 20 lines of effect logic
```

---

## File Organization

```
client/
├── constants/
│   └── index.js              (All configuration)
├── services/
│   └── apiClient.js          (API abstraction)
├── utils/
│   └── index.js              (Reusable functions)
├── hooks/
│   └── index.js              (Custom hooks)
├── types/
│   └── index.js              (JSDoc types)
├── contexts/
│   ├── LanguageContext.jsx   (Language + t())
│   ├── ThemeContext.jsx      (Dark/light theme)
│   └── SettingsContext.jsx   (App settings)
├── components/
│   ├── Navigation.jsx
│   ├── Footer.jsx
│   ├── ...
├── pages/
│   ├── Main/
│   ├── Product/
│   └── ...
├── translations/
│   ├── en.json               (English translations)
│   └── fa.json               (Farsi translations)
└── [Documentation]
    ├── COMPLETION_REPORT.md  (This session's work)
    ├── CRITICAL_FIXES.md     (Bug fixes)
    ├── QA_REPORT.md          (Testing report)
    ├── CHANGELOG.md          (File changes)
    ├── IMPROVEMENTS.md       (Metrics)
    └── README_REFACTORING.md (Quick ref)
```

---

## Testing Your Changes

### Before Deploying
1. ✅ Run `npm run build` - no errors
2. ✅ Test carousels on mobile/tablet/desktop
3. ✅ Test language switching
4. ✅ Test theme switching
5. ✅ Check console - no errors/warnings
6. ✅ Test forms - submission works
7. ✅ Test navigation - all links work

### Browser DevTools
- Open Console - should be clean ✅
- Open Network - check API calls ✅
- Open Performance - no jank ✅

---

## Troubleshooting

### Carousel Shows Only 1 Item
**Check:** Is SWIPER_CONFIG using camelCase?
```javascript
// ✅ Correct
{ slidesPerView: 1, spaceBetween: 30 }

// ❌ Wrong
{ SLIDES_PER_VIEW: 1, SPACE_BETWEEN: 30 }
```

### Translation Key Missing
**Check:** Is key defined in translation file?
```javascript
// Add to translations/en.json
{
  "mySection": {
    "myKey": "My text"
  }
}

// Use in component
t('mySection.myKey')
```

### Hardcoded Value Scattered
**Fix:** Add to constants/index.js
```javascript
export const MY_CONSTANT = 'my-value'
```

### Repeated Code in Components
**Fix:** Extract to utils/index.js or hooks/index.js
```javascript
// utils/index.js
export function myUtility() { ... }

// In component
import { myUtility } from '../utils/index'
```

---

## Need Help?

### Documentation Files
- **COMPLETION_REPORT.md** - Overview of all changes
- **CRITICAL_FIXES.md** - Swiper bug details
- **QA_REPORT.md** - Comprehensive testing report
- **README_REFACTORING.md** - Quick reference
- **CHANGELOG.md** - Detailed file changes
- **IMPROVEMENTS.md** - Code quality metrics

### Key Files to Reference
- `constants/index.js` - Find what you need
- `services/apiClient.js` - For API calls
- `utils/index.js` - For utilities
- `hooks/index.js` - For custom hooks
- `types/index.js` - For type definitions
- `translations/en.json` - For translations

---

**Last Updated:** May 19, 2026  
**Version:** 1.0 Complete  
**Status:** ✅ Production Ready
