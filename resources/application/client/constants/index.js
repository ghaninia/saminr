/**
 * Centralized constants for the application
 * Includes API endpoints, routes, assets, storage keys, and default values
 */

export const API_ENDPOINTS = {
  CLIENT: {
    SETTINGS: '/api/client/settings',
    CATEGORIES: '/api/client/categories',
    PRODUCTS: '/api/client/products',
    REVIEWS: '/api/client/reviews',
    SUBSCRIBE: '/api/client/subscribe',
  },
}

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:shortLink',
  CONTACT: '/contact',
  GALLERY: '/gallery',
  EVENTS: '/events',
  REGISTRATION_EVENT: '/registration-event',
  GET_TICKET: '/get-ticket',
}

export const ASSETS = {
  IMAGES: {
    NOT_FOUND: '/images/file-corrupted.svg',
    CORRUPTED: '/images/file-corrupted.svg',
  },
}

export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME: 'theme',
  SETTINGS_CACHE: 'client_settings_cache',
}

export const CACHE_TTL = {
  SETTINGS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
}

export const DEFAULTS = {
  LANGUAGE: 'fa',
  THEME: 'dark',
  PAGE_SIZE: 20,
  SWIPER: {
    SPACE_BETWEEN: 30,
    AUTOPLAY_DELAY: 3000,
  },
  HERO_SLOGAN_INTERVAL: 5000,
  PHONE: '8551004444',
  STAR_RATING: 5,
  FALLBACK_ROLE: {
    FA: 'مشتری',
    EN: 'Customer',
  },
  PRICE_DISPLAY: '--',
  DIR: {
    FA: 'rtl',
    EN: 'ltr',
  },
}

export const HTTP_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
}

export const LOCALES = {
  FA: 'fa',
  EN: 'en',
}

export const SWIPER_BREAKPOINTS = {
  MOBILE: 0,
  TABLET: 768,
  DESKTOP: 1024,
}

export const SWIPER_CONFIG = {
  PRODUCTS: {
    spaceBetween: 30,
    slidesPerView: 1,
    slidesPerGroup: 1,
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
  TESTIMONIALS: {
    spaceBetween: 30,
    slidesPerView: 3,
    breakpoints: {
      [SWIPER_BREAKPOINTS.MOBILE]: {
        slidesPerView: 1,
        spaceBetween: 30,
      },
      [SWIPER_BREAKPOINTS.TABLET]: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      [SWIPER_BREAKPOINTS.DESKTOP]: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  },
}

export const REGEX = {
  SVG_START: /^<svg/i,
  WHITESPACE: /\s+/g,
}
