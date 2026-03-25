import React, { useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';

const USER_TYPES = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' },
    { value: 'founder', label: 'Founder' },
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState('');

    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(emptyReviewDraft());
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

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
                setError(getApiErrorMessage(err, 'Unable to load reviews.'));
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
            setNotice('Saved.');
        } catch (err) {
            setSaveError(getApiErrorMessage(err, 'Unable to save review.'));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (item) => {
        if (!item?.id) return;
        const name = item?.fullname?.en ?? item?.fullname?.fa ?? `#${item.id}`;
        if (!window.confirm(`Delete review by "${name}"?`)) return;
        setNotice('');
        setError('');
        try {
            await adminApi.delete(`/reviews/${item.id}`);
            setItems((prev) => prev.filter((x) => x.id !== item.id));
            setNotice('Deleted.');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to delete review.'));
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">Loading reviews…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">Reviews</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">Manage customer reviews.</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="flex items-end gap-3">
                    <div className="w-60">
                        <Field label="Search">
                            <Input
                                placeholder="Name or review text…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </Field>
                    </div>
                    <Button onClick={openCreate}>New</Button>
                </div>
            </div>

            <div className="mt-4 divide-y divide-[color:var(--dash-border)] rounded-xl border border-[color:var(--dash-border)] overflow-hidden bg-[color:var(--dash-surface)]">
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[color:var(--dash-surface-3)]"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                    {item?.fullname?.en || item?.fullname?.fa || 'Unknown'}
                                </span>
                                <span className="text-xs text-[color:var(--dash-muted)] shrink-0">
                                    {'★'.repeat(item.star ?? 0)}{'☆'.repeat(5 - (item.star ?? 0))}
                                </span>
                                <span className="text-xs bg-[color:var(--dash-surface-2)] border border-[color:var(--dash-border)] rounded px-1.5 py-0.5 shrink-0">
                                    {item.user_type}
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-[color:var(--dash-muted)] truncate">
                                {item?.review?.en || item?.review?.fa || '—'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
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
                    <div className="px-4 py-3 text-sm text-[color:var(--dash-muted)]">No reviews found.</div>
                ) : null}
            </div>

            <Modal
                open={Boolean(editing)}
                title={editing?.id ? `Edit review #${editing.id}` : 'New review'}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        {/* Fullname */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Full Name (EN)">
                                <Input
                                    value={draft.fullname.en}
                                    onChange={(e) =>
                                        setDraft((p) => ({ ...p, fullname: { ...p.fullname, en: e.target.value } }))
                                    }
                                />
                            </Field>
                            <Field label="Full Name (FA)">
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
                        <Field label="Review (EN)">
                            <Textarea
                                rows={3}
                                value={draft.review.en}
                                onChange={(e) =>
                                    setDraft((p) => ({ ...p, review: { ...p.review, en: e.target.value } }))
                                }
                            />
                        </Field>
                        <Field label="Review (FA)">
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
                            <Field label="Star rating">
                                <StarPicker
                                    value={draft.star}
                                    onChange={(v) => setDraft((p) => ({ ...p, star: v }))}
                                />
                            </Field>
                            <Field label="User type">
                                <select
                                    className="w-full rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] px-3 py-2 text-sm text-[color:var(--dash-fg)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dash-accent)]"
                                    value={draft.user_type}
                                    onChange={(e) => setDraft((p) => ({ ...p, user_type: e.target.value }))}
                                >
                                    {USER_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Avatar */}
                        <Field label="Avatar URL" hint="Optional image URL for reviewer avatar.">
                            <Input
                                placeholder="https://..."
                                value={draft.avatar}
                                onChange={(e) => setDraft((p) => ({ ...p, avatar: e.target.value }))}
                            />
                        </Field>
                        {draft.avatar ? (
                            <div className="mt-1">
                                <img
                                    src={draft.avatar}
                                    alt="avatar preview"
                                    className="h-14 w-14 rounded-full object-cover border border-[color:var(--dash-border)]"
                                />
                            </div>
                        ) : null}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={closeEditor} disabled={saving}>
                                Cancel
                            </Button>
                            <Button onClick={save} disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
