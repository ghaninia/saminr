import { emptyVariantDraft } from './product.js';
import { parseNumber } from '../../shared/utils/common.js';

function buildVariantSignature(options) {
    return [...(options ?? [])]
        .map((option) => `${String(option?.attribute_key ?? '').trim()}=${String(option?.value ?? '').trim()}`)
        .sort()
        .join('|');
}

function buildVariantCombinations(attributes) {
    const configured = (attributes ?? [])
        .map((attribute) => ({
            key: String(attribute?.key ?? '').trim(),
            values: (attribute?.values ?? []).map((value) => String(value?.value ?? '').trim()).filter(Boolean),
        }))
        .filter((attribute) => attribute.key && attribute.values.length);

    if (!configured.length) return [];

    const combinations = [];

    const visit = (index, currentOptions) => {
        if (index === configured.length) {
            combinations.push(currentOptions);
            return;
        }

        const attribute = configured[index];
        attribute.values.forEach((value) => {
            visit(index + 1, [...currentOptions, { attribute_key: attribute.key, value }]);
        });
    };

    visit(0, []);

    return combinations;
}

export function syncVariantsWithAttributes(existingVariants, attributes, basePrice) {
    const combinations = buildVariantCombinations(attributes);
    if (!combinations.length) return [];

    const currentBySignature = new Map((existingVariants ?? []).map((variant) => [buildVariantSignature(variant?.options), variant]));
    const hasDefault = (existingVariants ?? []).some((variant) => Boolean(variant?.is_default));

    return combinations.map((options, index) => {
        const signature = buildVariantSignature(options);
        const current = currentBySignature.get(signature);

        return {
            ...(current ?? emptyVariantDraft(index)),
            sku_type: current?.sku_type ?? 'numeric',
            sku: current?.sku ?? '',
            price: current?.price ?? parseNumber(basePrice, 0),
            is_default: current ? Boolean(current.is_default) : (!hasDefault && index === 0),
            sort_order: index,
            options,
        };
    }).map((variant, index, list) => ({
        ...variant,
        is_default: list.some((entry) => entry.is_default) ? variant.is_default : index === 0,
    }));
}
