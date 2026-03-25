import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';

function safeText(value) {
    return String(value ?? '').trim();
}

export function SubscribersPage() {
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
                setError(getApiErrorMessage(err, 'Unable to load subscribers.'));
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedSearch, currentPage, perPage]);

    const subtitle = useMemo(() => {
        return `Showing ${subscribers.length} of ${total}`;
    }, [subscribers.length, total]);

    const search = () => {
        setCurrentPage(1);
        setAppliedSearch(subscriberSearch);
    };

    const removeSubscriber = async (item) => {
        if (!item?.id) return;
        if (!window.confirm(`Delete subscriber "${item?.email ?? item.id}"?`)) return;
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
            setNotice('Subscriber deleted.');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to delete subscriber.'));
        }
    };

    const copyEmails = async () => {
        const emails = subscribers.map((x) => safeText(x?.email)).filter(Boolean).join(', ');
        if (!emails) return;
        try {
            await navigator.clipboard.writeText(emails);
            setNotice('Copied emails to clipboard.');
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
                setNotice('Copied emails to clipboard.');
            } catch {
                setError('Unable to copy.');
            }
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">Loading subscribers…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">Subscribers</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">
                        Manage newsletter subscribers (API: `/api/admin/subscribers`).
                    </div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">{subtitle}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="flex items-end gap-3">
                    <div className="w-64">
                        <Field label="Search">
                            <Input
                                placeholder="Name or email…"
                                value={subscriberSearch}
                                onChange={(e) => setSubscriberSearch(e.target.value)}
                            />
                        </Field>
                    </div>
                    <Button variant="subtle" onClick={search}>
                        Search
                    </Button>
                    <Button variant="subtle" onClick={copyEmails} disabled={subscribers.length === 0}>
                        Copy emails
                    </Button>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                <div className="grid grid-cols-12 gap-2 bg-[color:var(--dash-surface-3)] px-3 py-2 text-xs text-[color:var(--dash-muted)]">
                    <div className="col-span-5">Fullname</div>
                    <div className="col-span-6">Email</div>
                    <div className="col-span-1 text-right"> </div>
                </div>
                <div className="divide-y divide-[color:var(--dash-border)]">
                    {subscribers.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-[color:var(--dash-muted)]">No subscribers.</div>
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
                                        Delete
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
