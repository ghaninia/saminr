import { deepClone as sharedDeepClone, slugify as sharedSlugify } from '../../shared/utils/common.js';

export function emptyProductDraft() {
    return {
        title: { fa: '', en: '' },
        subtitle: { fa: '', en: '' },
        description: { fa: '', en: '' },
        short_link: '',
        base_price: 0,
        cover_image: '',
        intro_video: '',
        gallery: [],
        is_active: true,
        category_ids: [],
        attributes: [],
        variants: [],
    };
}

export function emptyAttributeDraft(index = 0) {
    return {
        id: null,
        key: '',
        label: { fa: '', en: '' },
        value_type: 'select',
        sort_order: index,
        values: [emptyAttributeValueDraft(0)],
    };
}

export function emptyAttributeValueDraft(index = 0) {
    return {
        id: null,
        value: '',
        meta: null,
        sort_order: index,
    };
}

export function emptyVariantDraft(index = 0) {
    return {
        sku_type: 'numeric',
        sku: '',
        price: 0,
        is_default: index === 0,
        sort_order: index,
        options: [],
    };
}

export function slugify(value) {
    return sharedSlugify(value);
}

export function deepClone(value) {
    return sharedDeepClone(value);
}

export function normalizeProductDraft(source) {
    return {
        ...emptyProductDraft(),
        ...deepClone(source),
        title: {
            fa: source?.title?.fa ?? '',
            en: source?.title?.en ?? '',
        },
        subtitle: {
            fa: source?.subtitle?.fa ?? '',
            en: source?.subtitle?.en ?? '',
        },
        description: {
            fa: source?.description?.fa ?? '',
            en: source?.description?.en ?? '',
        },
        gallery: Array.isArray(source?.gallery) ? source.gallery.filter(Boolean) : [],
        category_ids: Array.isArray(source?.category_ids)
            ? source.category_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id))
            : [],
        attributes: Array.isArray(source?.attributes)
            ? source.attributes.map((attribute, index) => ({
                  ...emptyAttributeDraft(index),
                  ...attribute,
                  label: {
                      fa: attribute?.label?.fa ?? '',
                      en: attribute?.label?.en ?? '',
                  },
                  values: Array.isArray(attribute?.values)
                      ? attribute.values.map((entry, valueIndex) => ({
                            ...emptyAttributeValueDraft(valueIndex),
                            ...entry,
                            sort_order: Number(entry?.sort_order ?? valueIndex),
                        }))
                      : [emptyAttributeValueDraft(0)],
              }))
            : [],
                variants: Array.isArray(source?.variants)
                        ? source.variants.map((variant, variantIndex) => ({
                                    ...emptyVariantDraft(variantIndex),
                                    ...variant,
                            sku_type: String(variant?.sku_type ?? 'numeric'),
                            sku: variant?.sku ?? '',
                                    price: Number(variant?.price ?? 0),
                                    sort_order: Number(variant?.sort_order ?? variantIndex),
                                    is_default: Boolean(variant?.is_default),
                                    options: Array.isArray(variant?.options)
                                            ? variant.options.map((option) => ({
                                                        attribute_key: String(option?.attribute_key ?? ''),
                                                        value: String(option?.value ?? ''),
                                                }))
                                            : [],
                            }))
                        : [],
    };
}
