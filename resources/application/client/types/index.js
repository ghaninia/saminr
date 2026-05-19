/**
 * @typedef {Object} LocalizedString
 * @property {string} [fa] - Farsi translation
 * @property {string} [en] - English translation
 */

/**
 * @typedef {Object} ProductVariant
 * @property {number} [id]
 * @property {string} [color]
 * @property {string|number} [price]
 * @property {string|number} [price_i18n]
 * @property {boolean} [is_default]
 * @property {string} [sku]
 */

/**
 * @typedef {Object} ProductColor
 * @property {string} [name]
 * @property {string} [hex]
 */

/**
 * @typedef {Object} ProductAttribute
 * @property {string} [key]
 * @property {string|LocalizedString} [value]
 * @property {string|LocalizedString} [value_i18n]
 */

/**
 * @typedef {Object} Product
 * @property {number} [id]
 * @property {string} [short_link]
 * @property {string|LocalizedString} [title]
 * @property {string|LocalizedString} [subtitle]
 * @property {string|LocalizedString} [description]
 * @property {string} [image]
 * @property {string[]} [gallery]
 * @property {string} [intro_video]
 * @property {ProductVariant[]} [variants]
 * @property {ProductColor[]} [colors]
 * @property {ProductAttribute[]} [summary_attributes]
 * @property {ProductVariant} [default_variant]
 */

/**
 * @typedef {Object} Review
 * @property {number} [id]
 * @property {string} [name]
 * @property {string|LocalizedString} [fullname]
 * @property {string} [user_type_label]
 * @property {string|LocalizedString} [text]
 * @property {string|LocalizedString} [review]
 * @property {string} [avatar]
 * @property {number|string} [star]
 */

/**
 * @typedef {Object} Setting
 * @property {string} [key]
 * @property {string|number|boolean|LocalizedString} [value]
 * @property {string|number|boolean|LocalizedString} [default]
 */

/**
 * @typedef {Object} SettingsState
 * @property {Object} settings
 * @property {boolean} isLoading
 * @property {string|null} error
 * @property {boolean} shouldLoadFromApi
 */

/**
 * @typedef {Object} SwiperBreakpoint
 * @property {number} [slidesPerView]
 * @property {number} [slidesPerGroup]
 */

/**
 * @typedef {Object} MediaItem
 * @property {'image'|'video'} type
 * @property {string} url
 * @property {string} label
 */

/**
 * @typedef {Object} ApiResponse
 * @property {any} [data]
 * @property {string} [message]
 * @property {any} payload
 */

/**
 * @typedef {Object} GetSettingOptions
 * @property {any} [fallback]
 * @property {boolean} [localized]
 */

export {}
