import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../application/products/productService.js';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import {
    deepClone,
    emptyProductDraft,
    normalizeProductDraft,
    slugify,
} from '../../../domain/products/product.js';
import { syncVariantsWithAttributes } from '../../../domain/products/variantManager.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { ProductAttributeSelector } from './components/productAttributeSelector.jsx';
import { ProductVariantBuilder } from './components/productVariantBuilder.jsx';
import { ProductGalleryManager } from './components/productGalleryManager.jsx';
import { formatDecimalInput, formatTomanPreview, normalizeDecimalInput, parseNumber } from '../../../shared/utils/common.js';
import { useI18n } from '../../../application/i18n/i18nContext.jsx';

function extractMediaUrl(media) {
    if (!media) return null;
    if (typeof media === 'string') return media;
    if (typeof media === 'object' && typeof media.original_url === 'string') return media.original_url;
    return null;
}


function StepIcon({ stepKey }) {
    if (stepKey === 'basics') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <path d="M4 5h16M4 12h16M4 19h10" />
            </svg>
        );
    }

    if (stepKey === 'attributes') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
                <path d="M3 12.5 12 17l9-4.5" />
                <path d="M3 17.5 12 22l9-4.5" />
            </svg>
        );
    }

    if (stepKey === 'variants') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <rect x="3" y="4" width="18" height="5" rx="1" />
                <rect x="3" y="10" width="18" height="5" rx="1" />
                <rect x="3" y="16" width="18" height="5" rx="1" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
        </svg>
    );
}

export function ProductEditorPage() {
    const { t, locale } = useI18n();
    const navigate = useNavigate();
    const { productId } = useParams();
    const isEditing = Boolean(productId);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attributeCatalog, setAttributeCatalog] = useState([]);
    const [categories, setCategories] = useState([]);
    const [draft, setDraft] = useState(emptyProductDraft());
    const [shortLinkTouched, setShortLinkTouched] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [notice, setNotice] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});

    const editorSteps = useMemo(
        () => [
            { key: 'basics', label: t('products.editor.steps.basics') },
            { key: 'attributes', label: t('products.editor.steps.attributes') },
            { key: 'variants', label: t('products.editor.steps.variants') },
            { key: 'media', label: t('products.editor.steps.media') },
        ],
        [t],
    );

    useEffect(() => {
        let mounted = true;

        Promise.all([
            productService.listCategories(),
            productService.listAttributes(),
            isEditing ? productService.getProduct(productId) : Promise.resolve(null),
        ])
            .then(([categoryItems, attributes, product]) => {
                if (!mounted) return;
                setCategories(categoryItems ?? []);
                setAttributeCatalog(attributes ?? []);
                setDraft(product ? normalizeProductDraft(product) : emptyProductDraft());
                setShortLinkTouched(Boolean(product));
            })
            .catch((requestError) => {
                if (!mounted) return;
                setError(getApiErrorMessage(requestError, t('products.editor.unableToLoad')));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [isEditing, productId, t]);

    const attributeSelectionSignature = useMemo(() => JSON.stringify(
        (draft.attributes ?? []).map((attribute) => ({
            key: String(attribute?.key ?? '').trim(),
            values: (attribute?.values ?? []).map((value) => String(value?.value ?? '').trim()).filter(Boolean).sort(),
        }))
    ), [draft.attributes]);

    useEffect(() => {
        setDraft((previous) => {
            const nextVariants = syncVariantsWithAttributes(previous.variants ?? [], previous.attributes ?? [], previous.base_price);
            if (JSON.stringify(nextVariants) === JSON.stringify(previous.variants ?? [])) {
                return previous;
            }

            return {
                ...previous,
                variants: nextVariants,
            };
        });
    }, [attributeSelectionSignature, draft.base_price]);

    const configuredAttributes = useMemo(
        () => (draft.attributes ?? []).filter((attribute) => String(attribute?.key ?? '').trim() && (attribute?.values?.length ?? 0) > 0),
        [draft.attributes]
    );

    const basePriceHint = useMemo(() => formatTomanPreview(draft.base_price, locale), [draft.base_price, locale]);

    const validateStep = (step) => {
        const nextErrors = {};

        if (step === 0) {
            if (!String(draft?.title?.en ?? '').trim()) nextErrors.title_en = t('products.editor.validation.titleEnRequired');
            if (!String(draft?.title?.fa ?? '').trim()) nextErrors.title_fa = t('products.editor.validation.titleFaRequired');
            if (!String(draft?.short_link ?? '').trim()) nextErrors.short_link = t('products.editor.validation.shortLinkRequired');
            if (!Number.isFinite(Number(draft?.base_price)) || Number(draft?.base_price) < 0) nextErrors.base_price = t('products.editor.validation.basePriceInvalid');
            if (!Array.isArray(draft?.category_ids) || draft.category_ids.length === 0) nextErrors.category_ids = t('products.editor.validation.categoryRequired');
        }

        if (step === 1) {
            if (!Array.isArray(draft?.attributes) || draft.attributes.length === 0) {
                nextErrors.attributes = t('products.editor.validation.attachAttribute');
            } else if (configuredAttributes.length === 0) {
                nextErrors.attributes = t('products.editor.validation.selectAttributeValue');
            }
        }

        if (step === 2) {
            if (!Array.isArray(draft?.variants) || draft.variants.length === 0) {
                nextErrors.variants = t('products.editor.validation.variantRequired');
            }

            const hasDefault = (draft?.variants ?? []).some((variant) => Boolean(variant?.is_default));
            if (!hasDefault) nextErrors.variant_default = t('products.editor.validation.defaultVariantRequired');

            const hasMissingUnitType = (draft?.variants ?? []).some((variant) => !String(variant?.unit_type ?? '').trim());
            if (hasMissingUnitType) nextErrors.variant_unit_type = t('products.editor.validation.unitTypeRequired');

            const hasMissingUnit = (draft?.variants ?? []).some((variant) => {
                if (String(variant?.unit_type ?? 'numeric') !== 'numeric') return false;
                return !String(variant?.unit ?? '').trim();
            });
            if (hasMissingUnit) nextErrors.variant_unit = t('products.editor.validation.unitRequiredWhenNumeric');
        }

        return nextErrors;
    };

    const canMoveToStep = (targetStep) => {
        if (targetStep <= activeStep) return true;

        const currentErrors = validateStep(activeStep);
        setValidationErrors((previous) => ({ ...previous, ...currentErrors }));
        if (Object.keys(currentErrors).length > 0) {
            setSaveError(t('products.editor.completeRequiredBeforeContinue'));
            return false;
        }

        setSaveError('');
        return true;
    };

    const goToStep = (targetStep) => {
        const boundedTarget = Math.max(0, Math.min(editorSteps.length - 1, targetStep));
        if (!canMoveToStep(boundedTarget)) return;
        setActiveStep(boundedTarget);
    };

    const attachExistingAttribute = (attributeId) => {
        const source = attributeCatalog.find((attribute) => attribute.id === attributeId);
        if (!source) return;

        setDraft((previous) => {
            const exists = (previous.attributes ?? []).some((attribute) => attribute.id === source.id || attribute.key === source.key);
            if (exists) return previous;

            return {
                ...previous,
                attributes: [
                    ...(previous.attributes ?? []),
                    {
                        id: source.id,
                        key: source.key,
                        label: { fa: source?.label?.fa ?? '', en: source?.label?.en ?? '' },
                        value_type: source.value_type ?? 'select',
                        sort_order: source.sort_order ?? (previous.attributes ?? []).length,
                        values: [],
                    },
                ],
            };
        });
    };

    const removeAttribute = (attributeIndex) => {
        setDraft((previous) => ({
            ...previous,
            attributes: (previous.attributes ?? []).filter((_, index) => index !== attributeIndex),
        }));
    };

    const toggleCatalogValue = (attributeIndex, valueEntry) => {
        setDraft((previous) => {
            const nextAttributes = deepClone(previous.attributes ?? []);
            const attribute = nextAttributes[attributeIndex];
            if (!attribute) return previous;

            const nextValues = Array.isArray(attribute.values) ? [...attribute.values] : [];
            const existingIndex = nextValues.findIndex((entry) => entry?.id === valueEntry?.id || entry?.value === valueEntry?.value);

            if (existingIndex >= 0) {
                nextValues.splice(existingIndex, 1);
            } else {
                const fallbackValue = String(valueEntry?.value ?? '');
                nextValues.push({
                    id: valueEntry?.id ?? null,
                    value: fallbackValue,
                    value_i18n: {
                        fa: String(valueEntry?.value_i18n?.fa ?? fallbackValue),
                        en: String(valueEntry?.value_i18n?.en ?? fallbackValue),
                    },
                    meta: valueEntry?.meta ?? null,
                    sort_order: parseNumber(valueEntry?.sort_order, nextValues.length),
                });
            }

            attribute.values = nextValues;

            return {
                ...previous,
                attributes: nextAttributes,
            };
        });
    };

    const save = async () => {
        const allErrors = {
            ...validateStep(0),
            ...validateStep(1),
            ...validateStep(2),
        };

        if (Object.keys(allErrors).length > 0) {
            setValidationErrors(allErrors);
            setSaveError(t('products.editor.completeRequiredBeforeSave'));

            if (allErrors.title_en || allErrors.title_fa || allErrors.short_link || allErrors.base_price || allErrors.category_ids) setActiveStep(0);
            else if (allErrors.attributes) setActiveStep(1);
            else if (allErrors.variants || allErrors.variant_default || allErrors.variant_unit) setActiveStep(2);

            return;
        }

        setSaving(true);
        setSaveError('');
        setNotice('');

        try {
            const payload = {
                title: draft.title,
                subtitle: draft.subtitle,
                description: draft.description,
                short_link: draft.short_link,
                base_price: parseNumber(draft.base_price, 0),
                cover_image: extractMediaUrl(draft.cover_image),
                intro_video: extractMediaUrl(draft.intro_video),
                gallery: Array.isArray(draft.gallery)
                    ? draft.gallery
                        .map((entry) => extractMediaUrl(entry))
                        .filter((entry) => typeof entry === 'string' && entry.length > 0)
                    : [],
                is_active: Boolean(draft.is_active),
                category_ids: Array.isArray(draft.category_ids) ? draft.category_ids : [],
                attributes: (draft.attributes ?? []).map((attribute, index) => ({
                    id: attribute?.id ?? null,
                    key: String(attribute?.key ?? '').trim(),
                    label: {
                        fa: String(attribute?.label?.fa ?? ''),
                        en: String(attribute?.label?.en ?? ''),
                    },
                    value_type: String(attribute?.value_type ?? 'select'),
                    sort_order: parseNumber(attribute?.sort_order, index),
                    values: (attribute?.values ?? []).map((entry, entryIndex) => ({
                        id: entry?.id ?? null,
                        value: String(entry?.value ?? ''),
                        value_i18n: {
                            fa: String(entry?.value_i18n?.fa ?? entry?.value ?? ''),
                            en: String(entry?.value_i18n?.en ?? entry?.value ?? ''),
                        },
                        meta: entry?.meta ?? null,
                        sort_order: parseNumber(entry?.sort_order, entryIndex),
                    })),
                })),
                variants: (draft.variants ?? []).map((variant, index) => ({
                    unit_type: String(variant?.unit_type ?? 'numeric'),
                    unit: String(variant?.unit_type ?? 'numeric') === 'numeric'
                        ? (String(variant?.unit ?? '').trim() || null)
                        : null,
                    price: parseNumber(variant?.price, 0),
                    is_default: Boolean(variant?.is_default),
                    sort_order: parseNumber(variant?.sort_order, index),
                    options: (variant?.options ?? []).map((option) => ({
                        attribute_key: String(option?.attribute_key ?? '').trim(),
                        value: String(option?.value ?? '').trim(),
                    })),
                })),
            };

            const updated = isEditing
                ? await productService.updateProduct(productId, payload)
                : await productService.createProduct(payload);

            setDraft(normalizeProductDraft(updated));
            setNotice(t('products.editor.savedSuccessfully'));
            setShortLinkTouched(true);

            if (!isEditing && updated?.id) {
                navigate(`/products/${updated.id}/edit`, { replace: true });
            }
        } catch (requestError) {
            setSaveError(getApiErrorMessage(requestError, t('products.editor.unableToSave')));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('products.editor.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === editorSteps.length - 1;
    const progressPercent = ((activeStep + 1) / editorSteps.length) * 100;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link to="/products" className="text-xs text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]">{t('products.editor.backToProducts')}</Link>
                    <div className="mt-2 text-2xl font-semibold">{isEditing ? t('products.editor.editProduct') : t('products.editor.createProduct')}</div>
                    <div className="mt-1 max-w-2xl text-sm text-[color:var(--dash-muted)]">
                        {t('products.editor.description')}
                    </div>
                    {notice ? <div className="mt-3 text-sm text-emerald-400">{notice}</div> : null}
                    {saveError ? <div className="mt-3 text-sm text-red-400">{saveError}</div> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button className="h-10 min-w-[130px] whitespace-nowrap" type="button" onClick={save} disabled={saving}>{saving ? t('common.saving') : t('products.editor.saveProduct')}</Button>
                </div>
            </div>

            <section className="rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-3">
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--dash-surface-2)]">
                    <div
                        className="h-full rounded-full bg-[color:var(--dash-accent)] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    {editorSteps.map((step, index) => {
                        const selected = index === activeStep;
                        const completed = index < activeStep;

                        return (
                            <button
                                key={step.key}
                                type="button"
                                className={`group inline-flex h-12 w-full items-center gap-2 rounded-2xl border px-3 text-sm transition ${selected ? 'border-[color:var(--dash-accent)] bg-[color:var(--dash-accent)]/15 text-[color:var(--dash-fg)] shadow-[0_0_0_1px_var(--dash-accent)]/20' : completed ? 'border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] text-[color:var(--dash-fg)]' : 'border-[color:var(--dash-border)] text-[color:var(--dash-muted)] hover:bg-[color:var(--dash-surface-2)] hover:text-[color:var(--dash-fg)]'}`}
                                onClick={() => goToStep(index)}
                            >
                                <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${selected ? 'border-[color:var(--dash-accent)] bg-[color:var(--dash-accent)]/20 text-[color:var(--dash-fg)]' : completed ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-[color:var(--dash-border)] text-[color:var(--dash-muted)]'}`}>
                                    {completed ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                                            <path d="m5 12 4 4 10-10" />
                                        </svg>
                                    ) : index + 1}
                                </span>
                                <span className="inline-flex shrink-0 items-center text-[color:var(--dash-muted)] group-hover:text-[color:var(--dash-fg)]">
                                    <StepIcon stepKey={step.key} />
                                </span>
                                <span className="truncate font-medium">{step.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {activeStep === 0 ? (
                <section className="space-y-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5">
                    <div>
                        <div className="inline-flex items-center gap-2 text-base font-semibold">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[color:var(--dash-accent)]" aria-hidden="true">
                                <path d="M4 5h16M4 12h16M4 19h10" />
                            </svg>
                            {t('products.editor.productBasics')}
                        </div>
                        <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('products.editor.productBasicsDescription')}</div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label={t('products.editor.titleEnRequired')} error={validationErrors.title_en}><Input required value={draft.title.en} onChange={(event) => setDraft((previous) => ({ ...previous, title: { ...previous.title, en: event.target.value }, short_link: shortLinkTouched ? previous.short_link : slugify(event.target.value) }))} /></Field>
                        <Field label={t('products.editor.titleFaRequired')} error={validationErrors.title_fa}><Input required value={draft.title.fa} onChange={(event) => setDraft((previous) => ({ ...previous, title: { ...previous.title, fa: event.target.value } }))} /></Field>
                        <Field label={t('products.editor.shortLinkRequired')} error={validationErrors.short_link}><Input required value={draft.short_link} onChange={(event) => { setShortLinkTouched(true); setDraft((previous) => ({ ...previous, short_link: event.target.value })); }} /></Field>
                        <Field label={t('products.editor.basePriceRequired')} error={validationErrors.base_price}>
                            <Input
                                required
                                type="text"
                                inputMode="decimal"
                                value={formatDecimalInput(draft.base_price)}
                                onChange={(event) => setDraft((previous) => ({ ...previous, base_price: normalizeDecimalInput(event.target.value) }))}
                            />
                            {basePriceHint ? (
                                <div className="mt-2 flex items-start gap-2 rounded-xl border border-[color:var(--dash-accent)]/35 bg-[linear-gradient(135deg,rgba(88,138,255,0.12),rgba(88,138,255,0.03))] px-3 py-2 text-xs leading-5 text-[color:var(--dash-fg)] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-[color:var(--dash-accent)]" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                            <path d="M12 3v4" />
                                            <path d="m16.5 5.5-2.8 2.8" />
                                            <path d="M21 12h-4" />
                                            <path d="m16.5 18.5-2.8-2.8" />
                                            <path d="M12 21v-4" />
                                            <path d="m7.5 18.5 2.8-2.8" />
                                            <path d="M3 12h4" />
                                            <path d="m7.5 5.5 2.8 2.8" />
                                        </svg>
                                    </span>
                                    <span className="font-medium tracking-tight">{basePriceHint}</span>
                                </div>
                            ) : null}
                        </Field>
                        <Field label={t('products.editor.subtitleEn')}><Input value={draft.subtitle.en} onChange={(event) => setDraft((previous) => ({ ...previous, subtitle: { ...previous.subtitle, en: event.target.value } }))} /></Field>
                        <Field label={t('products.editor.subtitleFa')}><Input value={draft.subtitle.fa} onChange={(event) => setDraft((previous) => ({ ...previous, subtitle: { ...previous.subtitle, fa: event.target.value } }))} /></Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label={t('products.editor.descriptionEn')}><Textarea rows={5} value={draft.description.en} onChange={(event) => setDraft((previous) => ({ ...previous, description: { ...previous.description, en: event.target.value } }))} /></Field>
                        <Field label={t('products.editor.descriptionFa')}><Textarea rows={5} value={draft.description.fa} onChange={(event) => setDraft((previous) => ({ ...previous, description: { ...previous.description, fa: event.target.value } }))} /></Field>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const selected = (draft.category_ids ?? []).includes(category.id);

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`rounded-full border px-3 py-1.5 text-xs transition ${selected ? 'border-[color:var(--dash-accent)] bg-[color:var(--dash-accent)]/15 text-[color:var(--dash-fg)]' : 'border-[color:var(--dash-border)] text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]'}`}
                                    onClick={() => setDraft((previous) => ({
                                        ...previous,
                                        category_ids: selected
                                            ? (previous.category_ids ?? []).filter((id) => id !== category.id)
                                            : [...(previous.category_ids ?? []), category.id],
                                    }))}
                                >
                                    {category?.title?.fa || category?.title?.en || category?.name || `#${category.id}`}
                                </button>
                            );
                        })}
                    </div>
                    {validationErrors.category_ids ? <div className="text-xs text-red-400">{validationErrors.category_ids}</div> : null}

                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(event) => setDraft((previous) => ({ ...previous, is_active: event.target.checked }))} />
                        {t('products.editor.productIsActive')}
                    </label>
                </section>
            ) : null}

            {activeStep === 1 ? (
                <>
                    <ProductAttributeSelector
                        attributeCatalog={attributeCatalog}
                        attributes={draft.attributes ?? []}
                        onAttachAttribute={attachExistingAttribute}
                        onRemoveAttribute={removeAttribute}
                        onToggleCatalogValue={toggleCatalogValue}
                    />
                    {validationErrors.attributes ? <div className="text-xs text-red-400">{validationErrors.attributes}</div> : null}
                </>
            ) : null}

            {activeStep === 2 ? (
                <>
                    <ProductVariantBuilder
                        attributes={configuredAttributes}
                        variants={draft.variants ?? []}
                        onChange={(variants) => setDraft((previous) => ({ ...previous, variants }))}
                    />
                    {validationErrors.variants ? <div className="text-xs text-red-400">{validationErrors.variants}</div> : null}
                    {validationErrors.variant_unit_type ? <div className="text-xs text-red-400">{validationErrors.variant_unit_type}</div> : null}
                    {validationErrors.variant_default ? <div className="text-xs text-red-400">{validationErrors.variant_default}</div> : null}
                    {validationErrors.variant_unit ? <div className="text-xs text-red-400">{validationErrors.variant_unit}</div> : null}
                </>
            ) : null}

            {activeStep === 3 ? (
                <section className="space-y-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5">
                    <ProductGalleryManager productId={productId} draft={draft} onDraftChange={setDraft} />
                </section>
            ) : null}

            <section className="flex items-center justify-between rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-4">
                <div className="text-sm text-[color:var(--dash-muted)]">
                    {t('products.editor.stepOf', { step: activeStep + 1, total: editorSteps.length, label: editorSteps[activeStep].label })}
                </div>
                <div className="flex items-center gap-2">
                    <Button className="h-10 min-w-[110px] whitespace-nowrap" type="button" variant="ghost" onClick={() => goToStep(activeStep - 1)} disabled={isFirstStep}>{t('products.editor.previous')}</Button>
                    <Button className="h-10 min-w-[110px] whitespace-nowrap" type="button" variant="subtle" onClick={() => goToStep(activeStep + 1)} disabled={isLastStep}>{t('products.editor.next')}</Button>
                    <Button className="h-10 min-w-[130px] whitespace-nowrap" type="button" onClick={save} disabled={saving}>{saving ? t('common.saving') : t('products.editor.saveProduct')}</Button>
                </div>
            </section>
        </div>
    );
}