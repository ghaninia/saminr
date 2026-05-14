import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';
import { useI18n } from '../../../application/i18n/i18nContext.jsx';
import { PasswordGenerator } from '../../../shared/ui/passwordGenerator.jsx';

const ROLE_OPTIONS = ['user', 'admin'];

function emptyDraft() {
    return {
        name: '',
        email: '',
        role: 'user',
        password: '',
        is_active: true,
    };
}

export function UsersPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [query, setQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [busyUserId, setBusyUserId] = useState(null);
    const perPage = useDashboardPerPage();

    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(emptyDraft());
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const extractListPayload = (payload, fallbackPage = 1) => {
        const root = payload ?? {};
        const nested = root?.data ?? {};

        const rows = Array.isArray(root?.data)
            ? root.data
            : Array.isArray(nested?.data)
                ? nested.data
                : Array.isArray(root?.items)
                    ? root.items
                    : [];

        const meta = root?.meta ?? nested?.meta ?? {};
        const currentPageValue = Number(meta?.current_page ?? root?.current_page ?? fallbackPage) || fallbackPage;
        const lastPageValue = Number(meta?.last_page ?? root?.last_page ?? 1) || 1;
        const totalValue = Number(meta?.total ?? root?.total ?? rows.length) || 0;

        return {
            rows,
            total: totalValue,
            currentPage: Math.max(1, currentPageValue),
            totalPages: Math.max(1, lastPageValue),
        };
    };

    const load = async (search = '', page = 1) => {
        setError('');
        const params = {
            page,
            per_page: perPage,
        };

        const normalized = String(search ?? '').trim();
        if (normalized) params.search = normalized;

        const res = await adminApi.get('/users', { params });
        const parsed = extractListPayload(res.data, page);

        setItems(parsed.rows);
        setTotal(parsed.total);
        setCurrentPage(parsed.currentPage);
        setTotalPages(parsed.totalPages);
    };

    useEffect(() => {
        (async () => {
            try {
                await load(appliedSearch, currentPage);
            } catch (requestError) {
                setError(getApiErrorMessage(requestError, t('users.unableToLoad')));
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedSearch, currentPage, perPage]);

    const subtitle = useMemo(
        () => t('users.showing', { current: items.length, total }),
        [items.length, total, t],
    );

    const applySearch = () => {
        setCurrentPage(1);
        setAppliedSearch(query);
    };

    const openCreate = () => {
        setEditing({ id: null });
        setDraft(emptyDraft());
        setSaveError('');
        setNotice('');
    };

    const openEdit = (item) => {
        setEditing(item);
        setDraft({
            name: item?.name ?? '',
            email: item?.email ?? '',
            role: item?.role ?? 'user',
            password: '',
            is_active: Boolean(item?.is_active),
        });
        setSaveError('');
        setNotice('');
    };

    const closeEditor = () => {
        if (saving) return;
        setEditing(null);
        setDraft(emptyDraft());
        setSaveError('');
    };

    const save = async () => {
        if (!editing) return;

        setSaving(true);
        setSaveError('');
        setNotice('');

        try {
            const payload = {
                name: draft.name,
                email: draft.email,
                role: draft.role,
                is_active: Boolean(draft.is_active),
            };

            if (draft.password.trim()) {
                payload.password = draft.password;
            }

            const res = editing?.id
                ? await adminApi.patch(`/users/${editing.id}`, payload)
                : await adminApi.post('/users', { ...payload, password: draft.password });

            const updated = res.data?.data ?? res.data;

            if (editing?.id) {
                setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
            } else {
                setItems((prev) => [updated, ...prev]);
            }

            setNotice(t('users.saved'));
            setEditing(null);
            setDraft(emptyDraft());
        } catch (requestError) {
            setSaveError(getApiErrorMessage(requestError, t('users.unableToSave')));
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (item) => {
        const nextStatus = !Boolean(item?.is_active);
        setBusyUserId(item.id);
        setError('');
        setNotice('');

        try {
            const res = await adminApi.patch(`/users/${item.id}/status`, { is_active: nextStatus });
            const updated = res.data?.data ?? res.data;
            setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
            setNotice(t('users.statusUpdated'));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, t('users.unableToUpdateStatus')));
        } finally {
            setBusyUserId(null);
        }
    };

    const removeUser = async (item) => {
        if (!item?.id) return;

        const confirmed = window.confirm(t('users.deleteConfirm', { name: item?.name || item?.email || item.id }));
        if (!confirmed) return;

        setBusyUserId(item.id);
        setError('');
        setNotice('');

        try {
            await adminApi.delete(`/users/${item.id}`);
            await load(appliedSearch, currentPage);
            setNotice(t('users.deleted'));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, t('users.unableToDelete')));
        } finally {
            setBusyUserId(null);
        }
    };


    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('users.loading')}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">{t('users.title')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('users.description')}</div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">{subtitle}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                    {error ? <div className="mt-2 text-sm text-red-400">{error}</div> : null}
                </div>
                <div className="flex items-end gap-3">
                    <div className="w-64">
                        <Field label={t('common.search')}>
                            <Input
                                placeholder={t('users.searchPlaceholder')}
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </Field>
                    </div>
                    <Button variant="subtle" onClick={applySearch}>{t('users.search')}</Button>
                    <Button onClick={openCreate}>{t('users.create')}</Button>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                <div className="grid grid-cols-12 gap-2 bg-[color:var(--dash-surface-3)] px-3 py-2 text-xs text-[color:var(--dash-muted)]">
                    <div className="col-span-5">{t('users.email')}</div>
                    <div className="col-span-3">{t('users.role')}</div>
                    <div className="col-span-2">{t('users.status')}</div>
                    <div className="col-span-2 text-right">{t('products.actions')}</div>
                </div>

                <div className="divide-y divide-[color:var(--dash-border)]">
                    {items.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-[color:var(--dash-muted)]">{t('users.noItems')}</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center">
                                <div className="col-span-5 truncate text-[color:var(--dash-muted)]">{item?.email || '-'}</div>
                                <div className="col-span-3">
                                    <span className="inline-flex rounded-full border border-[color:var(--dash-border)] px-2 py-0.5 text-xs">
                                        {t(`users.roles.${item?.role ?? 'user'}`)}
                                    </span>
                                </div>
                                <div className="col-span-1">
                                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${item?.deleted_at ? 'border-red-500/40 bg-red-500/10 text-red-300' : item?.is_active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
                                        {item?.deleted_at ? t('users.deletedStatus') : item?.is_active ? t('users.active') : t('users.inactive')}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <div className="inline-flex overflow-hidden rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)]">
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs text-[color:var(--dash-fg)] transition hover:bg-[color:var(--dash-surface)] disabled:opacity-50"
                                            onClick={() => openEdit(item)}
                                            disabled={Boolean(item?.deleted_at)}
                                        >
                                            {t('common.edit')}
                                        </button>
                                        <button
                                            type="button"
                                            className="border-l border-[color:var(--dash-border)] px-2.5 py-1 text-xs text-[color:var(--dash-fg)] transition hover:bg-[color:var(--dash-surface)] disabled:opacity-50"
                                            disabled={busyUserId === item.id || Boolean(item?.deleted_at)}
                                            onClick={() => toggleStatus(item)}
                                        >
                                            {item?.is_active ? t('users.deactivate') : t('users.activate')}
                                        </button>
                                        <button
                                            type="button"
                                            className="border-l border-[color:var(--dash-border)] px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                            disabled={busyUserId === item.id || Boolean(item?.deleted_at)}
                                            onClick={() => removeUser(item)}
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={total}
                perPage={perPage}
                onPageChange={setCurrentPage}
            />

            <Modal
                open={Boolean(editing)}
                title={editing?.id ? `${t('common.edit')}: ${editing?.name || editing?.email || editing?.id}` : t('users.create')}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        <Field label={t('users.name')}>
                            <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
                        </Field>

                        <Field label={t('users.email')}>
                            <Input
                                type="email"
                                autoComplete="email"
                                value={draft.email}
                                onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                            />
                        </Field>

                        <Field label={t('users.role')}>
                            <select
                                className="w-full rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] px-3 py-2 text-sm text-[color:var(--dash-fg)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dash-accent)]"
                                value={draft.role}
                                onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value }))}
                            >
                                {ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role}>{t(`users.roles.${role}`)}</option>
                                ))}
                            </select>
                        </Field>

                        <PasswordGenerator
                            value={draft.password}
                            onChange={(next) => setDraft((prev) => ({ ...prev, password: next }))}
                            t={t}
                            hint={editing?.id ? t('users.passwordHintEdit') : t('users.passwordHintCreate')}
                        />

                        <label className="inline-flex items-center gap-2 text-sm text-[color:var(--dash-muted)]">
                            <input
                                type="checkbox"
                                checked={Boolean(draft.is_active)}
                                onChange={(event) => setDraft((prev) => ({ ...prev, is_active: event.target.checked }))}
                            />
                            {t('users.isActive')}
                        </label>

                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={closeEditor} disabled={saving}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="button" onClick={save} disabled={saving}>
                                {saving ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
