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
import { useI18n } from '../../../application/i18n/i18nContext.jsx';
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
    const { t } = useI18n();
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
                setError(getApiErrorMessage(err, t('categories.unableToLoad')));
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
            setNotice(t('categories.saved'));
        } catch (err) {
            setSaveError(getApiErrorMessage(err, t('categories.saveError')));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (item) => {
        if (!item?.id) return;
        if (!window.confirm(t('categories.deleteConfirm', { name: item?.title?.en ?? item?.short_link ?? item.id }))) return;
        setNotice('');
        setError('');
        try {
            await adminApi.delete(`/categories/${item.id}`);
            setItems((prev) => prev.filter((x) => x.id !== item.id));
            setNotice(t('categories.deleted'));
        } catch (err) {
            setError(getApiErrorMessage(err, t('categories.deleteError')));
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

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('categories.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">{t('categories.title')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('categories.description')}</div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">{t('categories.showing', { current: pagedItems.length, total: filtered.length })}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="flex items-end gap-3">
                    <div className="w-60">
                        <Field label={t('common.search')}>
                            <Input
                                placeholder={t('categories.searchPlaceholder')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </Field>
                    </div>
                    <Button onClick={openCreate}>{t('categories.create')}</Button>
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
                                {item?.title?.en || item?.title?.fa || t('categories.untitled')}
                            </div>
                            <div className="mt-1 text-xs text-[color:var(--dash-muted)] truncate">
                                {item.short_link} · {item?.subtitle?.en || item?.subtitle?.fa || '—'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(item)}>
                                {t('common.edit')}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => remove(item)}>
                                {t('common.delete')}
                            </Button>
                        </div>
                    </div>
                ))}
                {!filtered.length ? (
                    <div className="px-4 py-3 text-sm text-[color:var(--dash-muted)]">{t('categories.noItems')}</div>
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
                title={editing?.id ? `${t('common.edit')}: ${editing?.title?.en ?? editing?.short_link ?? editing.id}` : t('categories.create')}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label={t('categories.titleEn')}>
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
                            <Field label={t('categories.titleFa')}>
                                <Input
                                    value={draft.title.fa}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: { ...p.title, fa: e.target.value } }))}
                                />
                            </Field>
                            <Field label={t('categories.subtitleEn')}>
                                <Input
                                    value={draft.subtitle.en}
                                    onChange={(e) => setDraft((p) => ({ ...p, subtitle: { ...p.subtitle, en: e.target.value } }))}
                                />
                            </Field>
                            <Field label={t('categories.subtitleFa')}>
                                <Input
                                    value={draft.subtitle.fa}
                                    onChange={(e) => setDraft((p) => ({ ...p, subtitle: { ...p.subtitle, fa: e.target.value } }))}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label={t('categories.shortLink')} hint={t('categories.shortLinkHint')}>
                                <Input
                                    value={draft.short_link}
                                    onChange={(e) => {
                                        setShortLinkTouched(true);
                                        setDraft((p) => ({ ...p, short_link: e.target.value }));
                                    }}
                                />
                            </Field>
                            <Field label={t('categories.color')} hint={t('categories.colorHint')}>
                                <Input value={draft.color} onChange={(e) => setDraft((p) => ({ ...p, color: e.target.value }))} />
                            </Field>
                            <Field label={t('categories.icon')} hint={t('categories.iconHint')}>
                                <Input value={draft.icon} onChange={(e) => setDraft((p) => ({ ...p, icon: e.target.value }))} />
                            </Field>
                            <Field label={t('categories.imageLabel')} hint={t('categories.imageHint')}>
                                <Input value={draft.image} onChange={(e) => setDraft((p) => ({ ...p, image: e.target.value }))} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label={t('categories.contentEn')}>
                                <Textarea
                                    rows={6}
                                    value={draft.content.en}
                                    onChange={(e) => setDraft((p) => ({ ...p, content: { ...p.content, en: e.target.value } }))}
                                />
                            </Field>
                            <Field label={t('categories.contentFa')}>
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
                                label={t('categories.imageLabel')}
                                hint={t('categories.imageHint')}
                                uploadTitle={editing?.id ? t('categories.chooseImage') : t('categories.saveFirst')}
                                uploadHint={t('categories.imageHint')}
                                selectedPreviewLabel={t('categories.selectedPreview')}
                                storedPreviewLabel={t('categories.storedPreview')}
                                previewSourceLabel={t('categories.previewSource')}
                                showValueField={false}
                                onUpload={async ({ entityId, file, onProgress }) => {
                                    const payload = await uploadFile(entityId, file, onProgress);
                                    const url = payload?.url ?? '';
                                    const updatedCategory = payload?.category ?? null;
                                    if (updatedCategory?.id) {
                                        setItems((prev) => prev.map((x) => (x.id === updatedCategory.id ? updatedCategory : x)));
                                        setEditing((prev) => (prev?.id === updatedCategory.id ? updatedCategory : prev));
                                        setNotice(t('categories.imageUploaded'));
                                    }
                                    return url;
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" disabled={saving} onClick={closeEditor}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="button" disabled={saving} onClick={save}>
                                {saving ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
