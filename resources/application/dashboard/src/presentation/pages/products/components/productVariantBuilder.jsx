import React from 'react';
import { Input } from '../../../../shared/ui/input.jsx';
import { formatPrice, parseNumber } from '../../../../shared/utils/common.js';
import { useI18n } from '../../../../application/i18n/i18nContext.jsx';

const UNIT_TYPES = [
    { value: 'numeric', key: 'numeric' },
    { value: 'infinite', key: 'infinite' },
    { value: 'contact', key: 'contact' },
];

export function ProductVariantBuilder({ attributes, variants, onChange }) {
    const { t, locale } = useI18n();
    const configuredAttributes = (attributes ?? []).filter((attribute) => String(attribute?.key ?? '').trim() && (attribute?.values?.length ?? 0) > 0);
    const attributeByKey = new Map(configuredAttributes.map((attribute) => [String(attribute?.key ?? ''), attribute]));

    const updateVariant = (variantIndex, patch) => {
        onChange((variants ?? []).map((variant, currentIndex) => (
            currentIndex === variantIndex ? { ...variant, ...patch } : variant
        )));
    };

    const setDefaultVariant = (variantIndex) => {
        onChange((variants ?? []).map((variant, currentIndex) => ({
            ...variant,
            is_default: currentIndex === variantIndex,
        })));
    };

    return (
        <section className="space-y-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-base font-semibold">{t('products.editor.variantPricing')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">
                        {t('products.editor.variantPricingDescription')}
                    </div>
                </div>
                <div className="rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] px-3 py-2 text-right">
                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--dash-muted)]">{t('products.editor.combinations')}</div>
                    <div className="text-lg font-semibold">{variants?.length ?? 0}</div>
                </div>
            </div>

            {!configuredAttributes.length ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--dash-border)] px-4 py-5 text-sm text-[color:var(--dash-muted)]">
                    {t('products.editor.selectAttributeValueForVariants')}
                </div>
            ) : null}

            {(variants?.length ?? 0) > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-[color:var(--dash-border)]">
                    <div className="grid grid-cols-[minmax(0,2fr)_300px_160px_120px] gap-0 bg-[color:var(--dash-surface-2)] text-xs font-semibold uppercase tracking-wider text-[color:var(--dash-muted)]">
                        <div className="px-4 py-3">{t('products.editor.variant')}</div>
                        <div className="px-4 py-3">{t('products.editor.unit')}</div>
                        <div className="px-4 py-3">{t('products.editor.price')}</div>
                        <div className="px-4 py-3">{t('products.editor.default')}</div>
                    </div>
                    <div className="divide-y divide-[color:var(--dash-border)]">
                        {(variants ?? []).map((variant, index) => (
                            <div key={(variant?.options ?? []).map((option) => `${option.attribute_key}:${option.value}`).join('|') || index} className="grid grid-cols-[minmax(0,2fr)_300px_160px_120px] gap-0 items-center bg-[color:var(--dash-surface)]">
                                <div className="px-4 py-3 min-w-0">
                                    <div className="flex flex-wrap gap-2">
                                        {(variant?.options ?? []).map((option) => (
                                            (() => {
                                                const attribute = attributeByKey.get(String(option?.attribute_key ?? ''));
                                                const isColor = String(attribute?.value_type ?? '') === 'color';
                                                const matchedValue = (attribute?.values ?? []).find((entry) => String(entry?.value ?? '') === String(option?.value ?? ''));
                                                const colorHex = isColor ? String(matchedValue?.meta?.hex ?? '').trim() : '';
                                                const localizedValue = matchedValue?.value_i18n?.[locale]
                                                    ?? matchedValue?.value_i18n?.fa
                                                    ?? matchedValue?.value_i18n?.en
                                                    ?? option?.value;

                                                return (
                                                    <span key={`${option.attribute_key}-${option.value}`} className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] px-2.5 py-1 text-xs">
                                                        {isColor && colorHex ? (
                                                            <span
                                                                className="h-3 w-3 rounded-full border border-black/20"
                                                                style={{ backgroundColor: colorHex }}
                                                                title={colorHex}
                                                                aria-hidden="true"
                                                            />
                                                        ) : null}
                                                        <span>{option?.attribute_key}: {localizedValue}</span>
                                                    </span>
                                                );
                                            })()
                                        ))}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="flex items-center gap-2 rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] p-1.5">
                                        <select
                                            className="h-9 w-[120px] rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] px-2 text-sm"
                                            value={variant?.unit_type ?? 'numeric'}
                                            onChange={(event) => {
                                                const nextType = event.target.value;
                                                updateVariant(index, {
                                                    unit_type: nextType,
                                                    unit: nextType === 'numeric' ? (variant?.unit ?? '') : '',
                                                });
                                            }}
                                        >
                                            {UNIT_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>{t(`products.editor.unitTypes.${type.key}`)}</option>
                                            ))}
                                        </select>
                                        {(variant?.unit_type ?? 'numeric') === 'numeric' ? (
                                            <Input
                                                className="h-9 flex-1"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                placeholder={t('products.editor.unitNumber')}
                                                value={variant?.unit ?? ''}
                                                onChange={(event) => updateVariant(index, { unit: event.target.value.replace(/[^0-9]/g, '') })}
                                            />
                                        ) : (
                                            <div className="h-9 flex-1" aria-hidden="true" />
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <Input type="number" min="0" step="0.01" value={variant?.price ?? 0} onChange={(event) => updateVariant(index, { price: event.target.value })} />
                                </div>
                                <div className="px-4 py-3">
                                    <label className="inline-flex items-center gap-2 text-sm">
                                        <input type="radio" checked={Boolean(variant?.is_default)} onChange={() => setDefaultVariant(index)} />
                                        {t('products.editor.default')}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {(variants?.length ?? 0) > 0 ? (
                <div className="text-xs text-[color:var(--dash-muted)]">
                    {t('products.priceRange')}: {formatPrice(Math.min(...variants.map((variant) => parseNumber(variant?.price, 0))))} - {formatPrice(Math.max(...variants.map((variant) => parseNumber(variant?.price, 0))))}
                </div>
            ) : null}
        </section>
    );
}