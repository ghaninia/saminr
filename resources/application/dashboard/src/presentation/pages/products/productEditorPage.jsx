import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../application/products/productService.js';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import {
    deepClone,
    emptyProductDraft,
    emptyVariantDraft,
    normalizeProductDraft,
    slugify,
} from '../../../domain/products/product.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { ProductAttributeSelector } from './components/productAttributeSelector.jsx';
import { ProductVariantBuilder } from './components/productVariantBuilder.jsx';

function parseNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

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

function syncVariantsWithAttributes(existingVariants, attributes, basePrice) {
    const combinations = buildVariantCombinations(attributes);
    if (!combinations.length) return [];

    const currentBySignature = new Map((existingVariants ?? []).map((variant) => [buildVariantSignature(variant?.options), variant]));
    const hasDefault = (existingVariants ?? []).some((variant) => Boolean(variant?.is_default));

    return combinations.map((options, index) => {
        const signature = buildVariantSignature(options);
        const current = currentBySignature.get(signature);

        return {
            ...(current ?? emptyVariantDraft(index)),
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

export function ProductEditorPage() {
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
    const [uploadField, setUploadField] = useState('cover_image');
    const fileInputRef = useRef(null);

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
                setError(getApiErrorMessage(requestError, 'Unable to load product editor.'));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [isEditing, productId]);

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
                nextValues.push({
                    id: valueEntry?.id ?? null,
                    value: String(valueEntry?.value ?? ''),
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
                cover_image: draft.cover_image || null,
                intro_video: draft.intro_video || null,
                gallery: Array.isArray(draft.gallery) ? draft.gallery.filter(Boolean) : [],
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
                        meta: entry?.meta ?? null,
                        sort_order: parseNumber(entry?.sort_order, entryIndex),
                    })),
                })),
                variants: (draft.variants ?? []).map((variant, index) => ({
                    sku: String(variant?.sku ?? '').trim() || null,
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
            setNotice('Saved successfully.');
            setShortLinkTouched(true);

            if (!isEditing && updated?.id) {
                navigate(`/products/${updated.id}/edit`, { replace: true });
            }
        } catch (requestError) {
            setSaveError(getApiErrorMessage(requestError, 'Unable to save product.'));
        } finally {
            setSaving(false);
        }
    };

    const uploadMedia = async (file) => {
        if (!productId || !file) return;

        const form = new FormData();
        form.append('file', file);
        form.append('field', uploadField);

        const payload = await productService.uploadProductMedia(productId, form);
        const updatedProduct = payload?.product ?? null;

        if (updatedProduct?.id) {
            setDraft(normalizeProductDraft(updatedProduct));
            setNotice('Media uploaded.');
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">Loading product editor…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link to="/products" className="text-xs text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]">← Back to products</Link>
                    <div className="mt-2 text-2xl font-semibold">{isEditing ? 'Edit product' : 'Create product'}</div>
                    <div className="mt-1 max-w-2xl text-sm text-[color:var(--dash-muted)]">
                        A full-page editor is easier for dense product data. Select attributes first, then price the generated variants.
                    </div>
                    {notice ? <div className="mt-3 text-sm text-emerald-400">{notice}</div> : null}
                    {saveError ? <div className="mt-3 text-sm text-red-400">{saveError}</div> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="ghost" onClick={() => navigate('/products')}>Cancel</Button>
                    <Button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Button>
                </div>
            </div>

            <section className="space-y-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5">
                <div>
                    <div className="text-base font-semibold">Product basics</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">Keep the basic information here. Pricing stays inside the variant section below.</div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Title EN"><Input value={draft.title.en} onChange={(event) => setDraft((previous) => ({ ...previous, title: { ...previous.title, en: event.target.value }, short_link: shortLinkTouched ? previous.short_link : slugify(event.target.value) }))} /></Field>
                    <Field label="Title FA"><Input value={draft.title.fa} onChange={(event) => setDraft((previous) => ({ ...previous, title: { ...previous.title, fa: event.target.value } }))} /></Field>
                    <Field label="Short link"><Input value={draft.short_link} onChange={(event) => { setShortLinkTouched(true); setDraft((previous) => ({ ...previous, short_link: event.target.value })); }} /></Field>
                    <Field label="Base price"><Input type="number" min="0" step="0.01" value={draft.base_price} onChange={(event) => setDraft((previous) => ({ ...previous, base_price: event.target.value }))} /></Field>
                    <Field label="Subtitle EN"><Input value={draft.subtitle.en} onChange={(event) => setDraft((previous) => ({ ...previous, subtitle: { ...previous.subtitle, en: event.target.value } }))} /></Field>
                    <Field label="Subtitle FA"><Input value={draft.subtitle.fa} onChange={(event) => setDraft((previous) => ({ ...previous, subtitle: { ...previous.subtitle, fa: event.target.value } }))} /></Field>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Description EN"><Textarea rows={5} value={draft.description.en} onChange={(event) => setDraft((previous) => ({ ...previous, description: { ...previous.description, en: event.target.value } }))} /></Field>
                    <Field label="Description FA"><Textarea rows={5} value={draft.description.fa} onChange={(event) => setDraft((previous) => ({ ...previous, description: { ...previous.description, fa: event.target.value } }))} /></Field>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                        const selected = (draft.category_ids ?? []).includes(category.id);

                        return (
                            <button
                                key={category.id}
                                type="button"
                                className={`rounded-full border px-3 py-1.5 text-xs transition ${selected ? 'border-transparent bg-[color:var(--dash-accent)] text-black' : 'border-[color:var(--dash-border)] text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]'}`}
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

                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(event) => setDraft((previous) => ({ ...previous, is_active: event.target.checked }))} />
                    Product is active
                </label>
            </section>

            <ProductAttributeSelector
                attributeCatalog={attributeCatalog}
                attributes={draft.attributes ?? []}
                onAttachAttribute={attachExistingAttribute}
                onRemoveAttribute={removeAttribute}
                onToggleCatalogValue={toggleCatalogValue}
            />

            <ProductVariantBuilder
                attributes={configuredAttributes}
                variants={draft.variants ?? []}
                onChange={(variants) => setDraft((previous) => ({ ...previous, variants }))}
            />

            <section className="space-y-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5">
                <div>
                    <div className="text-base font-semibold">Media</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">Upload media after the product exists. New products can upload files right after the first save.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] px-3 py-2 text-sm" value={uploadField} onChange={(event) => setUploadField(event.target.value)}>
                        <option value="cover_image">Cover image</option>
                        <option value="gallery">Gallery</option>
                        <option value="intro_video">Intro video</option>
                    </select>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => uploadMedia(event.target.files?.[0])} />
                    <Button type="button" variant="subtle" disabled={!productId} onClick={() => fileInputRef.current?.click()}>Upload media</Button>
                    {!productId ? <span className="text-xs text-[color:var(--dash-muted)]">Save the product once to enable uploads.</span> : null}
                </div>
            </section>
        </div>
    );
}