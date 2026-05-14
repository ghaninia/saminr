import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { EntitySingleMediaUploader } from '../../../shared/ui/entitySingleMediaUploader.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';
import { deepClone, slugify } from '../../../shared/utils/common.js';

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
    };

    const closeEditor = () => {
        if (saving) return;
        setEditing(null);
        setDraft(emptyCategoryDraft());
        setShortLinkTouched(false);
        setSaveError('');
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

    const uploadFile = async (categoryId, file, onProgress) => {
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
                onProgress?.({ loaded: evt.loaded, total: evt.total, percent });
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
                            <EntitySingleMediaUploader
                                entityId={editing?.id}
                                value={draft.image}
                                onValueChange={(value) => setDraft((p) => ({ ...p, image: value }))}
                                label="Image URL"
                                hint="Upload an image for this category. Stored on the public disk under uploads/."
                                uploadTitle={editing?.id ? 'Choose file' : 'Save first'}
                                uploadHint="Upload an image and the image URL will be updated automatically."
                                selectedPreviewLabel="Selected file preview"
                                storedPreviewLabel="Stored image preview"
                                previewSourceLabel="Category preview"
                                showValueField={false}
                                onUpload={async ({ entityId, file, onProgress }) => {
                                    const payload = await uploadFile(entityId, file, onProgress);
                                    const url = payload?.url ?? '';
                                    const updatedCategory = payload?.category ?? null;
                                    if (updatedCategory?.id) {
                                        setItems((prev) => prev.map((x) => (x.id === updatedCategory.id ? updatedCategory : x)));
                                        setEditing((prev) => (prev?.id === updatedCategory.id ? updatedCategory : prev));
                                        setNotice('Uploaded.');
                                    }
                                    return url;
                                }}
                            />
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
