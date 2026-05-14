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

export function NewslettersPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [newsletters, setNewsletters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const perPage = useDashboardPerPage();
    const [selectedNewsletterId, setSelectedNewsletterId] = useState(null);

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [subject, setSubject] = useState('');
    const [html, setHtml] = useState('');

    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');

    const [previewOpen, setPreviewOpen] = useState(false);

    const load = async (page = 1) => {
        setError('');
        setNotice('');
        const res = await adminApi.get('/newsletters', {
            params: {
                page,
                per_page: perPage,
            },
        });

        const meta = res.data?.meta ?? {};
        setNewsletters(res.data?.data ?? []);
        setCurrentPage(typeof meta.current_page === 'number' ? meta.current_page : page);
        setTotalPages(typeof meta.last_page === 'number' ? meta.last_page : 1);
        setTotal(typeof meta.total === 'number' ? meta.total : 0);
    };

    useEffect(() => {
        (async () => {
            try {
                await load(currentPage);
            } catch (err) {
                setError(getApiErrorMessage(err, t('newsletter.newsletters.unableToLoad')));
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, perPage]);

    const selectedNewsletter = useMemo(() => {
        if (!selectedNewsletterId) return null;
        return newsletters.find((x) => String(x.id) === String(selectedNewsletterId)) ?? null;
    }, [newsletters, selectedNewsletterId]);

    const createNewsletter = async () => {
        setCreating(true);
        setCreateError('');
        setNotice('');
        try {
            const payload = { subject: safeText(subject), html: String(html ?? '') };
            const res = await adminApi.post('/newsletters', payload);
            const created = res.data?.data ?? res.data;
            setCurrentPage(1);
            await load(1);
            setSelectedNewsletterId(created?.id ?? null);
            setSubject('');
            setHtml('');
            setNotice(t('newsletter.newsletters.saved'));
        } catch (err) {
            setCreateError(getApiErrorMessage(err, t('newsletter.newsletters.saveError')));
        } finally {
            setCreating(false);
        }
    };

    const sendNewsletter = async () => {
        if (!selectedNewsletter?.id) return;
        if (!window.confirm(t('newsletter.newsletters.sendConfirm', { subject: selectedNewsletter.subject }))) return;
        setSending(true);
        setSendError('');
        setNotice('');
        try {
            const res = await adminApi.post(`/newsletters/${selectedNewsletter.id}/send`);
            const updated = res.data?.data ?? res.data;
            setNewsletters((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setNotice(t('newsletter.newsletters.queued'));
        } catch (err) {
            setSendError(getApiErrorMessage(err, t('newsletter.newsletters.sendError')));
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('newsletter.newsletters.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="text-lg font-semibold">{t('newsletter.newsletters.title')}</div>
            <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('newsletter.newsletters.description')}</div>
            {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
            {sendError ? <div className="mt-2 text-sm text-red-400">{sendError}</div> : null}

            <div className="mt-6 grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <div className="text-sm font-medium">{t('newsletter.newsletters.createTitle')}</div>
                    <div className="mt-3 space-y-3">
                        <Field label={t('newsletter.newsletters.subject')}>
                            <Input
                                placeholder={t('newsletter.newsletters.subject')}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </Field>
                        <Field label={t('newsletter.newsletters.html')}>
                            <Textarea
                                rows={12}
                                placeholder={t('newsletter.newsletters.htmlPlaceholder')}
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                            />
                        </Field>
                        {createError ? <div className="text-sm text-red-400">{createError}</div> : null}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={createNewsletter}
                                disabled={creating || !safeText(subject) || !safeText(html)}
                            >
                                {creating ? t('common.saving') : t('common.save')}
                            </Button>
                            <Button variant="subtle" onClick={() => setPreviewOpen(true)} disabled={!safeText(html)}>
                                {t('newsletter.newsletters.preview')}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-medium">{t('newsletter.newsletters.history')}</div>
                            <div className="mt-1 text-xs text-[color:var(--dash-muted)]">
                                {t('newsletter.newsletters.showing', { current: newsletters.length, total })}
                            </div>
                        </div>
                        <Button variant="subtle" onClick={sendNewsletter} disabled={!selectedNewsletter || sending}>
                            {sending ? t('newsletter.newsletters.queue') : t('newsletter.newsletters.send')}
                        </Button>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                        <div className="divide-y divide-[color:var(--dash-border)]">
                            {newsletters.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-[color:var(--dash-muted)]">{t('newsletter.newsletters.noItems')}</div>
                            ) : (
                                newsletters.map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-[color:var(--dash-surface-3)]"
                                    >
                                        <input
                                            type="radio"
                                            name="newsletter"
                                            className="mt-1"
                                            checked={String(selectedNewsletterId) === String(item.id)}
                                            onChange={() => setSelectedNewsletterId(item.id)}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm">
                                                {safeText(item.subject)}
                                            </div>
                                            <div className="mt-1 text-xs text-[color:var(--dash-muted)]">
                                                {t('newsletter.newsletters.status')}: {safeText(item.status) || t('newsletter.newsletters.draft')}
                                                {item.sent_count ? ` • ${t('newsletter.newsletters.sent')}: ${item.sent_count}` : ''}
                                                {item.last_error ? ` • ${t('newsletter.newsletters.lastError')}: ${safeText(item.last_error)}` : ''}
                                            </div>
                                        </div>
                                    </label>
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
            </div>

            <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={t('newsletter.newsletters.preview')}>
                <div className="space-y-3">
                    <div className="text-xs text-[color:var(--dash-muted)]">{t('newsletter.newsletters.previewHint')}</div>
                    <div className="rounded-xl border border-[color:var(--dash-border)] bg-white text-neutral-900 p-4 overflow-auto max-h-[60vh]">
                        {/* eslint-disable-next-line react/no-danger */}
                        <div dangerouslySetInnerHTML={{ __html: String(html ?? '') }} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
