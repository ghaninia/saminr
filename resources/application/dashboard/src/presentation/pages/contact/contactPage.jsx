import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';
import { useI18n } from '../../../application/i18n/i18nContext.jsx';

function safeText(value) {
    return String(value ?? '').trim();
}

function StatusBadge({ label, active }) {
    return (
        <span
            className={[
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                active
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[color:var(--dash-surface-3)] text-[color:var(--dash-muted)]',
            ].join(' ')}
        >
            {label}
        </span>
    );
}

export function ContactPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [messages, setMessages] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = useDashboardPerPage();

    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');

    // View modal
    const [viewMessage, setViewMessage] = useState(null);

    // Reply modal
    const [replyMessage, setReplyMessage] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);
    const [replyError, setReplyError] = useState('');

    const load = async (searchQuery = '', page = 1) => {
        setError('');
        setNotice('');
        const q = safeText(searchQuery);
        const params = { page, per_page: perPage };
        if (q) params.search = q;
        const res = await adminApi.get('/contact-messages', { params });
        const meta = res.data?.meta ?? {};
        setMessages(res.data?.data ?? []);
        setTotal(typeof meta.total === 'number' ? meta.total : 0);
        setCurrentPage(typeof meta.current_page === 'number' ? meta.current_page : page);
        setTotalPages(typeof meta.last_page === 'number' ? meta.last_page : 1);
    };

    useEffect(() => {
        (async () => {
            try {
                await load(appliedSearch, currentPage);
            } catch (err) {
                setError(getApiErrorMessage(err, t('contact.unableToLoad')));
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedSearch, currentPage, perPage]);

    const subtitle = useMemo(
        () => t('contact.showing', { current: messages.length, total }),
        [messages.length, total, t],
    );

    const handleSearch = () => {
        setCurrentPage(1);
        setAppliedSearch(search);
    };

    const handleMarkRead = async (msg) => {
        if (!msg?.id) return;
        setError('');
        setNotice('');
        try {
            await adminApi.post(`/contact-messages/${msg.id}/mark-read`);
            await load(appliedSearch, currentPage);
            setNotice(t('contact.markedRead'));
            if (viewMessage?.id === msg.id) {
                setViewMessage((prev) => prev ? { ...prev, is_read: true } : prev);
            }
        } catch (err) {
            setError(getApiErrorMessage(err, t('contact.markReadError')));
        }
    };

    const openReply = (msg) => {
        setReplyMessage(msg);
        setReplyContent('');
        setReplyError('');
    };

    const handleSendReply = async () => {
        if (!replyMessage?.id) return;
        const content = safeText(replyContent);
        if (!content) {
            setReplyError(t('contact.replyContentRequired'));
            return;
        }
        setReplying(true);
        setReplyError('');
        try {
            await adminApi.post(`/contact-messages/${replyMessage.id}/reply`, { content });
            setReplyMessage(null);
            setReplyContent('');
            await load(appliedSearch, currentPage);
            setNotice(t('contact.replySent'));
            if (viewMessage?.id === replyMessage.id) {
                setViewMessage((prev) => prev ? { ...prev, is_read: true, is_answered: true } : prev);
            }
        } catch (err) {
            setReplyError(getApiErrorMessage(err, t('contact.replyError')));
        } finally {
            setReplying(false);
        }
    };

    const handleDelete = async (msg) => {
        if (!msg?.id) return;
        if (!window.confirm(t('contact.deleteConfirm', { name: msg.email ?? msg.id }))) return;
        setError('');
        setNotice('');
        try {
            await adminApi.delete(`/contact-messages/${msg.id}`);
            const nextPage = messages.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
            if (nextPage !== currentPage) {
                setCurrentPage(nextPage);
            } else {
                await load(appliedSearch, currentPage);
            }
            setNotice(t('contact.deleted'));
            if (viewMessage?.id === msg.id) setViewMessage(null);
        } catch (err) {
            setError(getApiErrorMessage(err, t('contact.deleteError')));
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('contact.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">{t('contact.title')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('contact.description')}</div>
                    <div className="mt-1 text-xs text-[color:var(--dash-muted-2)]">{subtitle}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                    {error ? <div className="mt-2 text-sm text-red-400">{error}</div> : null}
                </div>
            </div>

            {/* Search */}
            <div className="mt-4 flex gap-2">
                <Input
                    placeholder={t('contact.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                />
                <Button variant="subtle" onClick={handleSearch}>
                    {t('contact.search')}
                </Button>
            </div>

            {/* Table */}
            {messages.length === 0 ? (
                <div className="mt-6 text-sm text-[color:var(--dash-muted)]">{t('contact.noItems')}</div>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[680px] text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-[color:var(--dash-border)] text-[color:var(--dash-muted)] text-xs uppercase">
                                <th className="py-2 px-3 text-start font-medium">{t('contact.colFullname')}</th>
                                <th className="py-2 px-3 text-start font-medium">{t('contact.colEmail')}</th>
                                <th className="py-2 px-3 text-start font-medium">{t('contact.colStatus')}</th>
                                <th className="py-2 px-3 text-start font-medium">{t('contact.colDate')}</th>
                                <th className="py-2 px-3 text-start font-medium">{t('contact.colActions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((msg) => (
                                <tr
                                    key={msg.id}
                                    className="border-b border-[color:var(--dash-border)] hover:bg-[color:var(--dash-surface-2)] transition-colors"
                                >
                                    <td className="py-2.5 px-3 font-medium">
                                        {safeText(msg.fullname) || <span className="text-[color:var(--dash-muted)]">—</span>}
                                    </td>
                                    <td className="py-2.5 px-3 text-[color:var(--dash-muted)]">{safeText(msg.email)}</td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex flex-wrap gap-1">
                                            <StatusBadge label={t('contact.read')} active={msg.is_read} />
                                            <StatusBadge label={t('contact.answered')} active={msg.is_answered} />
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-[color:var(--dash-muted)] text-xs whitespace-nowrap">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <Button size="sm" variant="subtle" onClick={() => setViewMessage(msg)}>
                                                {t('common.view')}
                                            </Button>
                                            {!msg.is_read && (
                                                <Button size="sm" variant="subtle" onClick={() => handleMarkRead(msg)}>
                                                    {t('contact.markRead')}
                                                </Button>
                                            )}
                                            <Button size="sm" variant="subtle" onClick={() => openReply(msg)}>
                                                {t('contact.reply')}
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(msg)}>
                                                {t('common.delete')}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    className="mt-4"
                    current={currentPage}
                    total={totalPages}
                    onChange={(page) => setCurrentPage(page)}
                />
            )}

            {/* View Modal */}
            <Modal
                open={!!viewMessage}
                title={t('contact.viewTitle')}
                onClose={() => setViewMessage(null)}
            >
                {viewMessage && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-xs text-[color:var(--dash-muted)] mb-1">{t('contact.colFullname')}</div>
                                <div className="font-medium">{safeText(viewMessage.fullname)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-[color:var(--dash-muted)] mb-1">{t('contact.colEmail')}</div>
                                <div className="font-medium">{safeText(viewMessage.email)}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-[color:var(--dash-muted)] mb-1">{t('contact.colContent')}</div>
                            <div className="rounded-xl bg-[color:var(--dash-surface-3)] border border-[color:var(--dash-border)] p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                {safeText(viewMessage.content)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge label={t('contact.read')} active={viewMessage.is_read} />
                            <StatusBadge label={t('contact.answered')} active={viewMessage.is_answered} />
                            <span className="text-xs text-[color:var(--dash-muted)]">
                                {viewMessage.created_at ? new Date(viewMessage.created_at).toLocaleString() : ''}
                            </span>
                        </div>
                        <div className="flex gap-2 flex-wrap pt-2">
                            {!viewMessage.is_read && (
                                <Button
                                    variant="subtle"
                                    onClick={async () => {
                                        await handleMarkRead(viewMessage);
                                    }}
                                >
                                    {t('contact.markRead')}
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setViewMessage(null);
                                    openReply(viewMessage);
                                }}
                            >
                                {t('contact.reply')}
                            </Button>
                            <Button variant="danger" onClick={() => handleDelete(viewMessage)}>
                                {t('common.delete')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reply Modal */}
            <Modal
                open={!!replyMessage}
                title={t('contact.replyTitle', { email: replyMessage?.email ?? '' })}
                onClose={() => setReplyMessage(null)}
            >
                {replyMessage && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-[color:var(--dash-surface-3)] border border-[color:var(--dash-border)] p-4 text-sm leading-relaxed whitespace-pre-wrap text-[color:var(--dash-muted)]">
                            {safeText(replyMessage.content)}
                        </div>
                        <Field label={t('contact.replyContent')}>
                            <Textarea
                                rows={6}
                                placeholder={t('contact.replyPlaceholder')}
                                value={replyContent}
                                onChange={(e) => {
                                    setReplyContent(e.target.value);
                                    setReplyError('');
                                }}
                                disabled={replying}
                            />
                        </Field>
                        {replyError && <div className="text-sm text-red-400">{replyError}</div>}
                        <div className="flex gap-2">
                            <Button variant="primary" disabled={replying} onClick={handleSendReply}>
                                {replying ? t('contact.replySending') : t('contact.replySubmit')}
                            </Button>
                            <Button variant="subtle" onClick={() => setReplyMessage(null)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
