import React, { useMemo, useState } from 'react';
import { Button } from '../../../../shared/ui/button.jsx';
import { Input } from '../../../../shared/ui/input.jsx';

function resolveColorValue(value, meta) {
    const dbHex = String(meta?.hex ?? '').trim();
    if (dbHex) return dbHex;

    const raw = String(value ?? '').trim();
    if (!raw) return null;

    if (raw.startsWith('#') || raw.startsWith('rgb') || raw.startsWith('hsl')) {
        return raw;
    }

    return null;
}

export function ProductAttributeSelector({
    attributeCatalog,
    attributes,
    onAttachAttribute,
    onRemoveAttribute,
    onToggleCatalogValue,
}) {
    const [attributeQuery, setAttributeQuery] = useState('');
    const [valueQueries, setValueQueries] = useState({});
    const [expandedMap, setExpandedMap] = useState({});

    const attachedKeys = new Set((attributes ?? []).map((attribute) => String(attribute?.key ?? '').trim()).filter(Boolean));
    const availableAttributes = useMemo(() => {
        const base = (attributeCatalog ?? []).filter((attribute) => !attachedKeys.has(String(attribute?.key ?? '').trim()));
        const q = attributeQuery.trim().toLowerCase();
        if (!q) return base;

        return base.filter((attribute) => {
            const fa = String(attribute?.label?.fa ?? '').toLowerCase();
            const en = String(attribute?.label?.en ?? '').toLowerCase();
            const key = String(attribute?.key ?? '').toLowerCase();

            return fa.includes(q) || en.includes(q) || key.includes(q);
        });
    }, [attributeCatalog, attachedKeys, attributeQuery]);

    const buildAttributeUiKey = (attribute, index) => `${attribute?.id ?? 'custom'}-${attribute?.key ?? 'k'}-${index}`;

    const toggleExpanded = (uiKey) => {
        setExpandedMap((previous) => ({
            ...previous,
            [uiKey]: !previous[uiKey],
        }));
    };

    const setValueQuery = (uiKey, value) => {
        setValueQueries((previous) => ({
            ...previous,
            [uiKey]: value,
        }));
    };

    const selectAllCatalogValues = (attributeIndex, values) => {
        (values ?? []).forEach((valueEntry) => {
            onToggleCatalogValue(attributeIndex, valueEntry);
        });
    };

    const clearCatalogValues = (attributeIndex, values, selectedValues) => {
        (values ?? []).forEach((valueEntry) => {
            const isSelected = (selectedValues ?? []).some((entry) => entry?.id === valueEntry?.id || entry?.value === valueEntry?.value);
            if (isSelected) onToggleCatalogValue(attributeIndex, valueEntry);
        });
    };

    return (
        <section className="space-y-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-base font-semibold">Attributes for this product</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">
                        Pick only the values that belong to this product. Variants will be generated from these selections automatically.
                    </div>
                </div>
                <div className="w-full max-w-md space-y-2">
                    <Input
                        placeholder="Search global attributes..."
                        value={attributeQuery}
                        onChange={(event) => setAttributeQuery(event.target.value)}
                    />
                    <div className="max-h-44 overflow-auto rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] p-2">
                        {availableAttributes.length ? (
                            <div className="flex flex-wrap gap-2">
                                {availableAttributes.map((attribute) => (
                                    <button
                                        key={attribute.id}
                                        type="button"
                                        className="rounded-full border border-[color:var(--dash-border)] px-3 py-1.5 text-xs text-[color:var(--dash-muted)] transition hover:text-[color:var(--dash-fg)]"
                                        onClick={() => onAttachAttribute(attribute.id)}
                                    >
                                        + {attribute?.label?.fa || attribute?.label?.en || attribute?.key}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-[color:var(--dash-muted)]">No more global attributes found.</div>
                        )}
                    </div>
                </div>
            </div>

            {!(attributes ?? []).length ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--dash-border)] px-4 py-5 text-sm text-[color:var(--dash-muted)]">
                    Start with attributes like color, scent, wick, or candle type.
                </div>
            ) : null}

            <div className="space-y-3">
                {(attributes ?? []).map((attribute, index) => {
                    const uiKey = buildAttributeUiKey(attribute, index);
                    const catalogAttribute = (attributeCatalog ?? []).find((entry) => entry.id === attribute?.id);
                    const selectedValues = Array.isArray(attribute?.values) ? attribute.values : [];
                    const isColorAttribute = String(attribute?.key ?? '').trim() === 'candle_color' || String(attribute?.value_type ?? '') === 'color';
                    const isExpanded = expandedMap[uiKey] ?? selectedValues.length <= 8;
                    const valueQuery = String(valueQueries[uiKey] ?? '').trim().toLowerCase();

                    const filteredCatalogValues = (catalogAttribute?.values ?? []).filter((valueEntry) => {
                        if (!valueQuery) return true;
                        return String(valueEntry?.value ?? '').toLowerCase().includes(valueQuery);
                    });

                    return (
                        <div key={`${attribute?.id ?? 'custom'}-${index}`} className="rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] p-4 space-y-3">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0 flex-1">
                                    <>
                                        <div className="text-sm font-semibold">{attribute?.label?.fa || attribute?.label?.en || attribute?.key}</div>
                                        <div className="mt-1 text-xs text-[color:var(--dash-muted)]">Select which values are available for this product.</div>
                                    </>
                                    <div className="mt-2 text-xs text-[color:var(--dash-muted)]">Selected: {selectedValues.length}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" size="sm" variant="subtle" onClick={() => toggleExpanded(uiKey)}>{isExpanded ? 'Collapse' : 'Manage values'}</Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => onRemoveAttribute(index)}>Remove</Button>
                                </div>
                            </div>

                            <>
                                {isExpanded ? (
                                    <div className="space-y-3">
                                        {(catalogAttribute?.values ?? []).length > 12 ? (
                                            <div className="flex items-center gap-2">
                                                <Button type="button" size="sm" variant="ghost" onClick={() => selectAllCatalogValues(index, filteredCatalogValues)}>Select visible</Button>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => clearCatalogValues(index, filteredCatalogValues, selectedValues)}>Clear visible</Button>
                                            </div>
                                        ) : null}
                                        {(catalogAttribute?.values ?? []).length > 10 ? (
                                            <Input
                                                value={valueQueries[uiKey] ?? ''}
                                                placeholder="Search values..."
                                                onChange={(event) => setValueQuery(uiKey, event.target.value)}
                                            />
                                        ) : null}
                                        <div className="max-h-48 overflow-auto pr-1">
                                            <div className="flex flex-wrap gap-2">
                                                {filteredCatalogValues.map((valueEntry) => {
                                                    const selected = selectedValues.some((entry) => entry?.id === valueEntry.id || entry?.value === valueEntry.value);
                                                    const swatchColor = isColorAttribute ? resolveColorValue(valueEntry?.value, valueEntry?.meta) : null;

                                                    return (
                                                        <button
                                                            key={`${attribute.id}-${valueEntry.id ?? valueEntry.value}`}
                                                            type="button"
                                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${selected ? 'border-transparent bg-[color:var(--dash-accent)] text-black' : 'border-[color:var(--dash-border)] text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]'}`}
                                                            onClick={() => onToggleCatalogValue(index, valueEntry)}
                                                        >
                                                            {swatchColor ? (
                                                                <span
                                                                    className="h-4 w-4 rounded-full border border-black/20"
                                                                    style={{ backgroundColor: swatchColor }}
                                                                    aria-hidden="true"
                                                                />
                                                            ) : null}
                                                            {valueEntry?.value ?? ''}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedValues.slice(0, 6).map((valueEntry) => (
                                            <span key={`${attribute?.id}-${valueEntry?.id ?? valueEntry?.value}`} className="rounded-full border border-[color:var(--dash-border)] px-2.5 py-1 text-xs">
                                                {valueEntry?.value ?? ''}
                                            </span>
                                        ))}
                                        {selectedValues.length > 6 ? <span className="text-xs text-[color:var(--dash-muted)]">+{selectedValues.length - 6} more</span> : null}
                                    </div>
                                )}
                                <div className="text-xs text-[color:var(--dash-muted)]">
                                    {selectedValues.length
                                        ? `Selected values: ${selectedValues.map((entry) => entry?.value).filter(Boolean).join('، ')}`
                                        : 'No value selected yet.'}
                                </div>
                            </>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}