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
const USER_TYPES = [
    { value: 'customer', label: '' },
    { value: 'admin', label: '' },
    { value: 'founder', label: '' },
];

function StarPicker({ value, onChange }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`text-xl transition-colors ${n <= value ? 'text-yellow-400' : 'text-[color:var(--dash-muted)]'}`}
                >
                    ★
                </button>
            ))}
            <span className="ml-2 text-sm text-[color:var(--dash-muted)]">{value}/5</span>
        </div>
    );
}

function emptyReviewDraft() {
    return {
        fullname: { fa: '', en: '' },
        review: { fa: '', en: '' },
        star: 5,
        avatar: '',
        user_type: 'customer',
    };
}

export function ReviewsPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = useDashboardPerPage();

    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(emptyReviewDraft());
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const userTypes = useMemo(() => USER_TYPES.map((type) => ({
        ...type,
        label: t(`reviews.userTypes.${type.value}`),
    })), [t]);

    useEffect(() => {
        let mounted = true;
        adminApi
            .get('/reviews')
            .then((res) => {
                if (!mounted) return;
                setItems(res.data?.data ?? []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(getApiErrorMessage(err, t('reviews.unableToLoad')));
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
            const name = String(item?.fullname?.en ?? item?.fullname?.fa ?? '').toLowerCase();
            const text = String(item?.review?.en ?? item?.review?.fa ?? '').toLowerCase();
            return name.includes(q) || text.includes(q);
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
        setDraft(emptyReviewDraft());
    };

    const openEdit = (item) => {
        setNotice('');
        setSaveError('');
        setEditing(item);
        setDraft({
            fullname: { fa: item?.fullname?.fa ?? '', en: item?.fullname?.en ?? '' },
            review: { fa: item?.review?.fa ?? '', en: item?.review?.en ?? '' },
            star: item?.star ?? 5,
            avatar: item?.avatar ?? '',
            user_type: item?.user_type ?? 'customer',
        });
    };

    const closeEditor = () => {
        if (saving) return;
        setEditing(null);
        setDraft(emptyReviewDraft());
        setSaveError('');
    };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        setSaveError('');
        setNotice('');
        try {
            const payload = {
                fullname: draft.fullname,
                review: draft.review,
                star: draft.star,
                avatar: draft.avatar || null,
                user_type: draft.user_type,
            };

            const res = editing.id
                ? await adminApi.patch(`/reviews/${editing.id}`, payload)
                : await adminApi.post('/reviews', payload);

            const updated = res.data?.data ?? res.data;
            setItems((prev) => {
                if (!editing.id) return [updated, ...prev];
                return prev.map((x) => (x.id === updated.id ? updated : x));
            });
            setEditing(null);
            setNotice(t('reviews.saved'));
        } catch (err) {
            setSaveError(getApiErrorMessage(err, t('reviews.saveError')));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (item) => {
        if (!item?.id) return;
        const name = item?.fullname?.en ?? item?.fullname?.fa ?? `#${item.id}`;
        if (!window.confirm(t('reviews.deleteConfirm', { name }))) return;
        setNotice('');
        setError('');
        try {
            await adminApi.delete(`/reviews/${item.id}`);
            setItems((prev) => prev.filter((x) => x.id !== item.id));
            setNotice(t('reviews.deleted'));
        } catch (err) {
            setError(getApiErrorMessage(err, t('reviews.deleteError')));
        }
    };

    const uploadFile = async (reviewId, file, onProgress) => {
        const form = new FormData();
        form.append('file', file);
        const res = await adminApi.post(`/reviews/${reviewId}/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => {
                if (!evt.total) return;
                const percent = Math.min(100, Math.max(0, Math.round((evt.loaded / evt.total) * 100)));
                onProgress?.({ loaded: evt.loaded, total: evt.total, percent });
            },
        });
        return res.data ?? {};
    };
    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('reviews.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">{t('reviews.title')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('reviews.description')}</div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">{t('reviews.showing', { current: pagedItems.length, total: filtered.length })}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="flex flex-wrap items-end gap-2 w-full sm:w-auto">
                    <div className="w-full sm:w-60">
                        <Field label={t('common.search')}>
                            <Input
                                placeholder={t('reviews.searchPlaceholder')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </Field>
                    </div>
                    <Button onClick={openCreate}>{t('reviews.create')}</Button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                <div className="min-w-[560px]">
                    <div className="grid grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)_140px] gap-0 bg-[color:var(--dash-surface-2)] text-xs font-semibold uppercase tracking-wider text-[color:var(--dash-muted)]">
                        <div className="px-4 py-3">{t('users.name')}</div>
                        <div className="px-4 py-3">{t('reviews.review')}</div>
                        <div className="px-4 py-3">{t('products.actions')}</div>
                    </div>
                    <div className="divide-y divide-[color:var(--dash-border)]">
                        {pagedItems.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)_140px] gap-0 items-center bg-[color:var(--dash-surface)] hover:bg-[color:var(--dash-surface-3)]"
                            >
                                <div className="min-w-0 px-4 py-3">
                                    <div className="text-sm font-medium truncate">
                                        {item?.fullname?.en || item?.fullname?.fa || t('reviews.unknown')}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="text-xs text-[color:var(--dash-muted)]">
                                            {'★'.repeat(item.star ?? 0)}{'☆'.repeat(5 - (item.star ?? 0))}
                                        </span>
                                        <span className="text-xs bg-[color:var(--dash-surface-2)] border border-[color:var(--dash-border)] rounded px-1.5 py-0.5">
                                            {item.user_type}
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0 px-4 py-3">
                                    <div className="text-xs text-[color:var(--dash-muted)] truncate">
                                        {item?.review?.en || item?.review?.fa || '—'}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="inline-flex overflow-hidden rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)]">
                                        <button
                                            type="button"
                                            className="px-3 py-1.5 text-xs text-[color:var(--dash-fg)] transition hover:bg-[color:var(--dash-surface)]"
                                            onClick={() => openEdit(item)}
                                        >
                                            {t('common.edit')}
                                        </button>
                                        <button
                                            type="button"
                                            className="border-l border-[color:var(--dash-border)] px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                                            onClick={() => remove(item)}
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!filtered.length ? (
                            <div className="px-4 py-10 text-center text-sm text-[color:var(--dash-muted)]">{t('reviews.noItems')}</div>
                        ) : null}
                    </div>
                </div>
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
                title={editing?.id ? `${t('common.edit')} ${t('reviews.review')} #${editing.id}` : `${t('reviews.create')} ${t('reviews.review')}`}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        {/* Fullname */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label={t('reviews.fullNameEn')}>
                                <Input
                                    value={draft.fullname.en}
                                    onChange={(e) =>
                                        setDraft((p) => ({ ...p, fullname: { ...p.fullname, en: e.target.value } }))
                                    }
                                />
                            </Field>
                            <Field label={t('reviews.fullNameFa')}>
                                <Input
                                    dir="rtl"
                                    value={draft.fullname.fa}
                                    onChange={(e) =>
                                        setDraft((p) => ({ ...p, fullname: { ...p.fullname, fa: e.target.value } }))
                                    }
                                />
                            </Field>
                        </div>

                        {/* Review text */}
                        <Field label={t('reviews.reviewEn')}>
                            <Textarea
                                rows={3}
                                value={draft.review.en}
                                onChange={(e) =>
                                    setDraft((p) => ({ ...p, review: { ...p.review, en: e.target.value } }))
                                }
                            />
                        </Field>
                        <Field label={t('reviews.reviewFa')}>
                            <Textarea
                                dir="rtl"
                                rows={3}
                                value={draft.review.fa}
                                onChange={(e) =>
                                    setDraft((p) => ({ ...p, review: { ...p.review, fa: e.target.value } }))
                                }
                            />
                        </Field>

                        {/* Star + user_type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                            <Field label={t('reviews.starRating')}>
                                <StarPicker
                                    value={draft.star}
                                    onChange={(v) => setDraft((p) => ({ ...p, star: v }))}
                                />
                            </Field>
                            <Field label={t('reviews.userType')}>
                                <select
                                    className="w-full rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] px-3 py-2 text-sm text-[color:var(--dash-fg)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dash-accent)]"
                                    value={draft.user_type}
                                    onChange={(e) => setDraft((p) => ({ ...p, user_type: e.target.value }))}
                                >
                                    {userTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Avatar */}
                        <EntitySingleMediaUploader
                            entityId={editing?.id}
                            value={draft.avatar}
                            onValueChange={(value) => setDraft((p) => ({ ...p, avatar: value }))}
                            label={t('reviews.avatarUrl')}
                            hint={t('reviews.avatarHint')}
                            previewKind="avatar"
                            uploadTitle={editing?.id ? t('reviews.chooseFile') : t('reviews.saveFirst')}
                            selectedPreviewLabel={t('reviews.selectedPreview')}
                            storedPreviewLabel={t('reviews.storedPreview')}
                            previewSourceLabel={t('reviews.reviewerAvatar')}
                            showValueField={false}
                            onUpload={async ({ entityId, file, onProgress }) => {
                                const payload = await uploadFile(entityId, file, onProgress);
                                const url = payload?.url ?? '';
                                const updatedReview = payload?.data ?? payload?.review ?? null;
                                if (updatedReview?.id) {
                                    setItems((prev) => prev.map((x) => (x.id === updatedReview.id ? updatedReview : x)));
                                    setEditing((prev) => (prev?.id === updatedReview.id ? updatedReview : prev));
                                    setNotice(t('reviews.uploaded'));
                                }
                                return url;
                            }}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={closeEditor} disabled={saving}>
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={save} disabled={saving}>
                                {saving ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
