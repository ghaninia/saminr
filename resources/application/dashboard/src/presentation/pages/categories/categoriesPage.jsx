import React, { useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';

function deepClone(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
    const input = String(value ?? '')
        .trim()
        .toLowerCase();
    if (!input) return '';

    const slug = input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return slug;
}

function isLikelyImageUrl(url) {
    if (!url) return false;
    return /\.(png|jpe?g|webp|svg|ico)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
}

function emptyCategoryDraft() {
    return {
        title: { fa: '', en: '' },
        subtitle: { fa: '', en: '' },
        content: { fa: '', en: '' },
        color: '',
        icon: '',
        short_link: '',
        image: '',
    };
}

export function CategoriesPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = useDashboardPerPage();

    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(emptyCategoryDraft());
    const [shortLinkTouched, setShortLinkTouched] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        adminApi
            .get('/categories')
            .then((res) => {
                if (!mounted) return;
                setItems(res.data?.data ?? []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(getApiErrorMessage(err, 'Unable to load categories.'));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((item) => {
            const title = String(item?.title?.en ?? item?.title?.fa ?? '').toLowerCase();
            const shortLink = String(item?.short_link ?? '').toLowerCase();
            return title.includes(q) || shortLink.includes(q);
        });
    }, [items, query]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / perPage)), [filtered.length, perPage]);

    const pagedItems = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, perPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const openCreate = () => {
        setNotice('');
        setSaveError('');
        setEditing({ id: null });
        setDraft(emptyCategoryDraft());
        setShortLinkTouched(false);
        setUploadProgress(0);
        if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
        setSelectedPreviewUrl('');
    };

    const openEdit = (item) => {
        setNotice('');
        setSaveError('');
        setEditing(item);
        setDraft({
            ...emptyCategoryDraft(),
            ...deepClone(item),
            title: { fa: item?.title?.fa ?? '', en: item?.title?.en ?? '' },
            subtitle: { fa: item?.subtitle?.fa ?? '', en: item?.subtitle?.en ?? '' },
            content: { fa: item?.content?.fa ?? '', en: item?.content?.en ?? '' },
        });
        setShortLinkTouched(true);
        setUploadProgress(0);
        if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
        setSelectedPreviewUrl('');
    };

    const closeEditor = () => {
        if (saving) return;
        setEditing(null);
        setDraft(emptyCategoryDraft());
        setShortLinkTouched(false);
        setSaveError('');
        setUploadProgress(0);
        if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
        setSelectedPreviewUrl('');
    };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        setSaveError('');
        setNotice('');
        try {
            const payload = {
                title: draft.title,
                subtitle: draft.subtitle,
                content: draft.content,
                color: draft.color || null,
                icon: draft.icon || null,
                short_link: draft.short_link,
                image: draft.image || null,
            };

            const res = editing.id
                ? await adminApi.patch(`/categories/${editing.id}`, payload)
                : await adminApi.post('/categories', payload);

            const updated = res.data?.data ?? res.data;
            setItems((prev) => {
                if (!editing.id) return [updated, ...prev];
                return prev.map((x) => (x.id === updated.id ? updated : x));
            });
            setEditing(null);
            setNotice('Saved.');
        } catch (err) {
            setSaveError(getApiErrorMessage(err, 'Unable to save category.'));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (item) => {
        if (!item?.id) return;
        if (!window.confirm(`Delete category "${item?.title?.en ?? item?.short_link ?? item.id}"?`)) return;
        setNotice('');
        setError('');
        try {
            await adminApi.delete(`/categories/${item.id}`);
            setItems((prev) => prev.filter((x) => x.id !== item.id));
            setNotice('Deleted.');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to delete category.'));
        }
    };

    const uploadFile = async (categoryId, file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('field', 'image');
        const res = await adminApi.post(`/categories/${categoryId}/upload`, form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (evt) => {
                if (!evt.total) return;
                const percent = Math.min(100, Math.max(0, Math.round((evt.loaded / evt.total) * 100)));
                setUploadProgress(percent);
            },
        });
        return res.data ?? {};
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">Loading categories…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">Categories</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">Manage categories (API: `/api/admin/categories`).</div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">Showing {pagedItems.length} of {filtered.length}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="flex items-end gap-3">
                    <div className="w-60">
                        <Field label="Search">
                            <Input
                                placeholder="Title or short link…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </Field>
                    </div>
                    <Button onClick={openCreate}>New</Button>
                </div>
            </div>

            <div className="mt-4 divide-y divide-[color:var(--dash-border)] rounded-xl border border-[color:var(--dash-border)] overflow-hidden bg-[color:var(--dash-surface)]">
                {pagedItems.map((item) => (
                    <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[color:var(--dash-surface-3)]"
                    >
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                                {item?.title?.en || item?.title?.fa || 'Untitled'}
                            </div>
                            <div className="mt-1 text-xs text-[color:var(--dash-muted)] truncate">
                                {item.short_link} · {item?.subtitle?.en || item?.subtitle?.fa || '—'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(item)}>
                                Edit
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => remove(item)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
                {!filtered.length ? (
                    <div className="px-4 py-3 text-sm text-[color:var(--dash-muted)]">No categories found.</div>
                ) : null}
            </div>

            <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                perPage={perPage}
                onPageChange={setCurrentPage}
            />

            <Modal
                open={Boolean(editing)}
                title={editing?.id ? `Edit: ${editing?.title?.en ?? editing?.short_link ?? editing.id}` : 'New category'}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Title (EN)">
                                <Input
                                    value={draft.title.en}
                                    onChange={(e) => {
                                        const en = e.target.value;
                                        setDraft((p) => {
                                            const next = { ...p, title: { ...p.title, en } };
                                            if (!shortLinkTouched) {
                                                next.short_link = slugify(en);
                                            }
                                            return next;
                                        });
                                    }}
                                />
                            </Field>
                            <Field label="Title (FA)">
                                <Input
                                    value={draft.title.fa}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: { ...p.title, fa: e.target.value } }))}
                                />
                            </Field>
                            <Field label="Subtitle (EN)">
                                <Input
                                    value={draft.subtitle.en}
                                    onChange={(e) => setDraft((p) => ({ ...p, subtitle: { ...p.subtitle, en: e.target.value } }))}
                                />
                            </Field>
                            <Field label="Subtitle (FA)">
                                <Input
                                    value={draft.subtitle.fa}
                                    onChange={(e) => setDraft((p) => ({ ...p, subtitle: { ...p.subtitle, fa: e.target.value } }))}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Short link" hint="Must be unique (e.g. soy-candle).">
                                <Input
                                    value={draft.short_link}
                                    onChange={(e) => {
                                        setShortLinkTouched(true);
                                        setDraft((p) => ({ ...p, short_link: e.target.value }));
                                    }}
                                />
                            </Field>
                            <Field label="Color" hint="Optional (text).">
                                <Input value={draft.color} onChange={(e) => setDraft((p) => ({ ...p, color: e.target.value }))} />
                            </Field>
                            <Field label="Icon" hint="Optional (icon class or URL).">
                                <Input value={draft.icon} onChange={(e) => setDraft((p) => ({ ...p, icon: e.target.value }))} />
                            </Field>
                            <Field label="Image URL" hint="Auto-filled after upload (or paste a URL).">
                                <Input value={draft.image} onChange={(e) => setDraft((p) => ({ ...p, image: e.target.value }))} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Content (EN)">
                                <Textarea
                                    rows={6}
                                    value={draft.content.en}
                                    onChange={(e) => setDraft((p) => ({ ...p, content: { ...p.content, en: e.target.value } }))}
                                />
                            </Field>
                            <Field label="Content (FA)">
                                <Textarea
                                    rows={6}
                                    value={draft.content.fa}
                                    onChange={(e) => setDraft((p) => ({ ...p, content: { ...p.content, fa: e.target.value } }))}
                                />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-[color:var(--dash-muted-2)]">
                                    Upload an image for this category. Stored on the `public` disk under `uploads/`.
                                </div>
                                <div className="inline-flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.webp,.svg,.ico,image/*"
                                        className="hidden"
                                        disabled={!editing.id}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file || !editing?.id) return;
                                            setSaveError('');
                                            try {
                                                setSaving(true);
                                                setUploadProgress(0);
                                                if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
                                                setSelectedPreviewUrl(URL.createObjectURL(file));

                                                const payload = await uploadFile(editing.id, file);
                                                const url = payload?.url ?? '';
                                                const updatedCategory = payload?.category ?? null;
                                                if (url) setDraft((p) => ({ ...p, image: url }));
                                                if (updatedCategory?.id) {
                                                    setItems((prev) => prev.map((x) => (x.id === updatedCategory.id ? updatedCategory : x)));
                                                    setEditing((prev) => (prev?.id === updatedCategory.id ? updatedCategory : prev));
                                                    setNotice('Uploaded.');
                                                }
                                            } catch (err) {
                                                setSaveError(getApiErrorMessage(err, 'Upload failed.'));
                                            } finally {
                                                setSaving(false);
                                                setUploadProgress(0);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="subtle"
                                        size="sm"
                                        disabled={saving || !editing?.id}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {saving ? 'Uploading…' : editing?.id ? 'Choose file' : 'Save first'}
                                    </Button>
                                </div>
                            </div>

                            {saving && uploadProgress > 0 ? (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted-2)]">
                                        <div>Uploading</div>
                                        <div>{uploadProgress}%</div>
                                    </div>
                                    <div className="h-2 rounded-full bg-[color:var(--dash-surface-3)] border border-[color:var(--dash-border)] overflow-hidden">
                                        <div className="h-full bg-indigo-500/70" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            ) : null}

                            {selectedPreviewUrl ? (
                                <div className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)] p-3">
                                    <div className="text-xs text-[color:var(--dash-muted-2)] mb-2">Selected file preview</div>
                                    <img
                                        src={selectedPreviewUrl}
                                        alt="Selected preview"
                                        className="max-h-36 object-contain rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-input-bg)]"
                                    />
                                </div>
                            ) : null}

                            {draft.image && isLikelyImageUrl(String(draft.image)) ? (
                                <div className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)] p-3">
                                    <div className="text-xs text-[color:var(--dash-muted-2)] mb-2">Stored image preview</div>
                                    <img
                                        src={String(draft.image)}
                                        alt="Preview"
                                        className="max-h-36 object-contain rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-input-bg)]"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" disabled={saving} onClick={closeEditor}>
                                Cancel
                            </Button>
                            <Button type="button" disabled={saving} onClick={save}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
