import React from 'react';
import { Input } from '../../../../shared/ui/input.jsx';

const SKU_TYPES = [
    { value: 'numeric', label: 'Numeric' },
    { value: 'infinite', label: 'Infinite' },
    { value: 'contact', label: 'Contact' },
];

function parseNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parseNumber(value, 0));
}

export function ProductVariantBuilder({ attributes, variants, onChange }) {
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
                    <div className="text-base font-semibold">Variant pricing</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">
                        Variants are generated automatically from the selected attribute values. You only set SKU, price, and the default variant.
                    </div>
                </div>
                <div className="rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] px-3 py-2 text-right">
                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--dash-muted)]">Combinations</div>
                    <div className="text-lg font-semibold">{variants?.length ?? 0}</div>
                </div>
            </div>

            {!configuredAttributes.length ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--dash-border)] px-4 py-5 text-sm text-[color:var(--dash-muted)]">
                    Select at least one attribute value to generate variants automatically.
                </div>
            ) : null}

            {(variants?.length ?? 0) > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-[color:var(--dash-border)]">
                    <div className="grid grid-cols-[minmax(0,2fr)_300px_160px_120px] gap-0 bg-[color:var(--dash-surface-2)] text-xs font-semibold uppercase tracking-wider text-[color:var(--dash-muted)]">
                        <div className="px-4 py-3">Variant</div>
                        <div className="px-4 py-3">SKU</div>
                        <div className="px-4 py-3">Price</div>
                        <div className="px-4 py-3">Default</div>
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
                                                        <span>{option?.attribute_key}: {option?.value}</span>
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
                                            value={variant?.sku_type ?? 'numeric'}
                                            onChange={(event) => {
                                                const nextType = event.target.value;
                                                updateVariant(index, {
                                                    sku_type: nextType,
                                                    sku: nextType === 'numeric' ? (variant?.sku ?? '') : '',
                                                });
                                            }}
                                        >
                                            {SKU_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                        {(variant?.sku_type ?? 'numeric') === 'numeric' ? (
                                            <Input
                                                className="h-9 flex-1"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                placeholder="SKU number"
                                                value={variant?.sku ?? ''}
                                                onChange={(event) => updateVariant(index, { sku: event.target.value.replace(/[^0-9]/g, '') })}
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
                                        Default
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {(variants?.length ?? 0) > 0 ? (
                <div className="text-xs text-[color:var(--dash-muted)]">
                    Price range: {formatPrice(Math.min(...variants.map((variant) => parseNumber(variant?.price, 0))))} - {formatPrice(Math.max(...variants.map((variant) => parseNumber(variant?.price, 0))))}
                </div>
            ) : null}
        </section>
    );
}