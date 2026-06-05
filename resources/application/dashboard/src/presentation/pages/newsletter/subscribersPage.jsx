import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';
import { useI18n } from '../../../application/i18n/i18nContext.jsx';

function safeText(value) {
    return String(value ?? '').trim();
}

export function SubscribersPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [subscriberSearch, setSubscriberSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [subscribers, setSubscribers] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = useDashboardPerPage();

    const load = async (search = '', page = 1) => {
        setError('');
        setNotice('');
        const q = safeText(search);
        const params = { page, per_page: perPage };
        if (q) params.search = q;
        const res = await adminApi.get('/subscribers', { params });

        const meta = res.data?.meta ?? {};
        setSubscribers(res.data?.data ?? []);
        setTotal(typeof meta.total === 'number' ? meta.total : 0);
        setCurrentPage(typeof meta.current_page === 'number' ? meta.current_page : page);
        setTotalPages(typeof meta.last_page === 'number' ? meta.last_page : 1);
    };

    useEffect(() => {
        (async () => {
            try {
                await load(appliedSearch, currentPage);
            } catch (err) {
                setError(getApiErrorMessage(err, t('newsletter.subscribers.unableToLoad')));
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedSearch, currentPage, perPage]);

    const subtitle = useMemo(
        () => t('newsletter.subscribers.showing', { current: subscribers.length, total }),
        [subscribers.length, total, t],
    );

    const search = () => {
        setCurrentPage(1);
        setAppliedSearch(subscriberSearch);
    };

    const removeSubscriber = async (item) => {
        if (!item?.id) return;
        if (!window.confirm(t('newsletter.subscribers.deleteConfirm', { name: item?.email ?? item.id }))) return;
        setError('');
        setNotice('');
        try {
            await adminApi.delete(`/subscribers/${item.id}`);
            const nextPage = subscribers.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
            if (nextPage !== currentPage) {
                setCurrentPage(nextPage);
            } else {
                await load(appliedSearch, currentPage);
            }
            setNotice(t('newsletter.subscribers.deleted'));
        } catch (err) {
            setError(getApiErrorMessage(err, t('newsletter.subscribers.deleteError')));
        }
    };

    const copyEmails = async () => {
        const emails = subscribers.map((x) => safeText(x?.email)).filter(Boolean).join(', ');
        if (!emails) return;
        try {
            await navigator.clipboard.writeText(emails);
            setNotice(t('newsletter.subscribers.copied'));
        } catch {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = emails;
                textarea.style.position = 'fixed';
                textarea.style.top = '-1000px';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setNotice(t('newsletter.subscribers.copied'));
            } catch {
                setError(t('newsletter.subscribers.copyError'));
            }
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('newsletter.subscribers.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">{t('newsletter.subscribers.title')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('newsletter.subscribers.description')}</div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">{subtitle}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="flex flex-wrap items-end gap-2 w-full sm:w-auto">
                    <div className="w-full sm:w-64">
                        <Field label={t('common.search')}>
                            <Input
                                placeholder={t('newsletter.subscribers.searchPlaceholder')}
                                value={subscriberSearch}
                                onChange={(e) => setSubscriberSearch(e.target.value)}
                            />
                        </Field>
                    </div>
                    <Button variant="subtle" onClick={search}>
                        {t('newsletter.subscribers.search')}
                    </Button>
                    <Button variant="subtle" onClick={copyEmails} disabled={subscribers.length === 0}>
                        {t('newsletter.subscribers.copyEmails')}
                    </Button>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                <div className="grid grid-cols-12 gap-2 bg-[color:var(--dash-surface-3)] px-3 py-2 text-xs text-[color:var(--dash-muted)]">
                    <div className="col-span-5">{t('newsletter.subscribers.fullname')}</div>
                    <div className="col-span-6">{t('newsletter.subscribers.email')}</div>
                    <div className="col-span-1 text-right"> </div>
                </div>
                <div className="divide-y divide-[color:var(--dash-border)]">
                    {subscribers.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-[color:var(--dash-muted)]">{t('newsletter.subscribers.noItems')}</div>
                    ) : (
                        subscribers.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-sm">
                                <div className="col-span-5 truncate">
                                    {safeText(item.fullname) || '—'}
                                </div>
                                <div className="col-span-6 truncate text-[color:var(--dash-muted)]">{safeText(item.email)}</div>
                                <div className="col-span-1 text-right">
                                    <button
                                        type="button"
                                        className="text-xs text-red-400 hover:text-red-300"
                                        onClick={() => removeSubscriber(item)}
                                    >
                                        {t('common.delete')}
                                    </button>
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
        </div>
    );
}
