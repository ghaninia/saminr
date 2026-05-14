import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { EntitySingleMediaUploader } from '../../../shared/ui/entitySingleMediaUploader.jsx';
import { updateDashboardPerPageCache, useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';
import { deepClone } from '../../../shared/utils/common.js';
import { useI18n } from '../../../application/i18n/i18nContext.jsx';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function truncate(text, max = 70) {
    const value = String(text ?? '');
    if (value.length <= max) return value;
    return `${value.slice(0, max - 1)}...`;
}

function summarizeSettingValue(item, t) {
    const value = item?.value ?? null;

    if (value === null || value === undefined || value === '') return t('settings.empty');

    if (typeof value === 'string') {
        const filename = value.split('?')[0].split('#')[0].split('/').pop();
        return truncate(filename && filename.length < 40 ? `${filename}` : value, 70);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return t('settings.empty');
        const first = value[0];
        if (first && typeof first === 'object' && ('en' in first || 'fa' in first)) {
            return t('settings.itemsWithPreview', { count: value.length, preview: truncate(first.en ?? first.fa ?? '...', 50) });
        }
        return t('settings.itemsCount', { count: value.length });
    }

    if (isPlainObject(value)) {
        if ('en' in value || 'fa' in value) {
            return `${truncate(value.en ?? '...', 45)} · ${truncate(value.fa ?? '...', 45)}`;
        }

        try {
            return truncate(JSON.stringify(value), 70);
        } catch {
            return t('settings.object');
        }
    }

    return truncate(String(value), 70);
}

export function SettingsPage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = useDashboardPerPage();

    const [editing, setEditing] = useState(null);
    const [draftValue, setDraftValue] = useState('');
    const [useDefault, setUseDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        let mounted = true;

        adminApi
            .get('/settings')
            .then((res) => {
                if (!mounted) return;
                setItems(res.data?.data ?? []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(getApiErrorMessage(err, t('settings.unableToLoad')));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [t]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((item) => String(item.key ?? '').toLowerCase().includes(q));
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

    const openEditor = (item) => {
        setNotice('');
        setSaveError('');
        setSaving(false);
        setEditing(item);
        setUseDefault(false);

        if (item.type === 'multiple') {
            const cloned = deepClone(item.value);
            if (Array.isArray(cloned) || isPlainObject(cloned)) {
                setDraftValue(cloned);
            } else if (Array.isArray(item.default) || isPlainObject(item.default)) {
                setDraftValue(deepClone(item.default));
            } else {
                setDraftValue({ fa: '', en: '' });
            }
            return;
        }

        if (item.type === 'array') {
            const data = item.value ?? item.default ?? [];
            setDraftValue(isPlainObject(data) || Array.isArray(data) ? deepClone(data) : []);
            return;
        }

        setDraftValue(item.value ?? '');
    };

    const closeEditor = () => {
        if (saving) return;
        setEditing(null);
        setDraftValue('');
        setUseDefault(false);
        setSaveError('');
    };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        setSaveError('');
        setNotice('');

        try {
            const res = await adminApi.patch(`/settings/${editing.id}`, {
                value: useDefault ? null : draftValue,
            });
            const updated = res.data?.data ?? res.data;

            if (String(updated?.key ?? '') === 'dashboard_items_per_page') {
                updateDashboardPerPageCache(updated?.value ?? updated?.default ?? 10);
            }

            setItems((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
            setEditing(null);
            setNotice(t('settings.saved'));
        } catch (err) {
            setSaveError(getApiErrorMessage(err, t('settings.unableToSave')));
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (settingId, file, onProgress) => {
        const form = new FormData();
        form.append('file', file);
        form.append('setting_id', String(settingId));
        const res = await adminApi.post('/uploads', form, {
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

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">{t('settings.loading')}</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">{t('settings.title')}</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('settings.description')}</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="w-60">
                    <Field label={t('common.search')}>
                        <Input placeholder={t('settings.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
                    </Field>
                </div>
            </div>

            <div className="mt-4 divide-y divide-[color:var(--dash-border)] rounded-xl border border-[color:var(--dash-border)] overflow-hidden bg-[color:var(--dash-surface)]">
                {pagedItems.map((item) => (
                    <details key={item.id} className="group">
                        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-4 hover:bg-[color:var(--dash-surface-3)]">
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{item.key}</div>
                                <div className="mt-1 text-xs text-[color:var(--dash-muted)] truncate">
                                    {summarizeSettingValue(item, t)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openEditor(item);
                                    }}
                                >
                                    {t('common.edit')}
                                </Button>
                                <div className="text-xs text-[color:var(--dash-muted-2)] group-open:text-[color:var(--dash-muted)]">{t('common.view')}</div>
                            </div>
                        </summary>
                        <div className="px-4 pb-4">
                            <pre className="dash-scroll text-xs text-[color:var(--dash-fg)] bg-[color:var(--dash-input-bg)] border border-[color:var(--dash-border)] rounded-lg px-3 py-2 overflow-auto">
                                {JSON.stringify(item.value, null, 2)}
                            </pre>
                        </div>
                    </details>
                ))}
                {!filtered.length ? (
                    <div className="px-4 py-3 text-sm text-[color:var(--dash-muted)]">{t('settings.noItems')}</div>
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
                title={editing ? `${t('common.edit')}: ${editing.key}` : t('settings.editSetting')}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-xs text-[color:var(--dash-muted)]">{t('settings.editing')}</div>
                            <label className="flex items-center gap-2 text-sm text-[color:var(--dash-muted)]">
                                <input
                                    type="checkbox"
                                    checked={useDefault}
                                    onChange={(e) => setUseDefault(e.target.checked)}
                                    className="accent-indigo-400"
                                />
                                {t('settings.useDefault')}
                            </label>
                        </div>

                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        <div className={useDefault ? 'opacity-60 pointer-events-none' : ''}>
                            {editing.type === 'multiple' ? (
                                <MultipleEditor value={draftValue} onChange={setDraftValue} t={t} />
                            ) : editing.type === 'array' ? (
                                <ArrayEditor value={draftValue} onChange={setDraftValue} t={t} />
                            ) : editing.type === 'rich_text' || editing.type === 'text' ? (
                                <Field label={t('settings.value')}>
                                    <Textarea value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} rows={10} />
                                </Field>
                            ) : editing.type === 'file' || editing.type === 'image' || editing.type === 'link' ? (
                                <EntitySingleMediaUploader
                                    entityId={editing?.id}
                                    value={draftValue}
                                    onValueChange={setDraftValue}
                                    label={t('settings.value')}
                                    hint={t('settings.uploadHint')}
                                    uploadTitle={editing?.id ? t('settings.chooseFile') : t('settings.saveFirst')}
                                    previewKind="image"
                                    selectedPreviewLabel={t('settings.selectedPreview')}
                                    storedPreviewLabel={t('settings.storedPreview')}
                                    previewSourceLabel={t('settings.previewSource')}
                                    showValueField={false}
                                    onUpload={async ({ entityId, file, onProgress }) => {
                                        const payload = await uploadFile(entityId, file, onProgress);
                                        const result = payload?.data ?? payload;
                                        const url = result?.url ?? '';
                                        const updatedSetting = result?.setting ?? null;
                                        if (updatedSetting?.id) {
                                            setItems((prev) =>
                                                prev.map((x) => (x.id === updatedSetting.id ? { ...x, ...updatedSetting } : x)),
                                            );
                                            setEditing((prev) => (prev?.id === updatedSetting.id ? { ...prev, ...updatedSetting } : prev));
                                            setNotice(t('settings.uploadSaved'));
                                        }
                                        return url;
                                    }}
                                />
                            ) : editing.type === 'email' ? (
                                <Field label={t('auth.email')}>
                                    <Input type="email" autoComplete="email" value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            ) : editing.type === 'website' ? (
                                <Field label={t('settings.website')} hint={t('settings.websiteHint')}>
                                    <Input type="url" inputMode="url" value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            ) : editing.type === 'number' ? (
                                <Field label={t('settings.number')}>
                                    <Input type="number" inputMode="numeric" value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            ) : (
                                <Field label={t('settings.value')}>
                                    <Input value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="subtle" onClick={closeEditor} disabled={saving}>
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

function MultipleEditor({ value, onChange, t }) {
    if (Array.isArray(value)) {
        return (
            <div className="space-y-3">
                <div className="text-xs text-[color:var(--dash-muted)]">{t('common.localizedList')}</div>
                <div className="space-y-3">
                    {value.map((row, idx) => (
                        <div key={idx} className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)] p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-[color:var(--dash-muted-2)]">{t('common.item')} {idx + 1}</div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onChange(value.filter((_, i) => i !== idx))}
                                >
                                    {t('common.remove')}
                                </Button>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label={t('common.english')}>
                                    <Textarea
                                        rows={3}
                                        value={row?.en ?? ''}
                                        onChange={(e) => {
                                            const next = value.slice();
                                            next[idx] = { ...(next[idx] ?? {}), en: e.target.value, fa: next[idx]?.fa ?? '' };
                                            onChange(next);
                                        }}
                                    />
                                </Field>
                                <Field label={t('common.persian')}>
                                    <Textarea
                                        rows={3}
                                        value={row?.fa ?? ''}
                                        onChange={(e) => {
                                            const next = value.slice();
                                            next[idx] = { ...(next[idx] ?? {}), fa: e.target.value, en: next[idx]?.en ?? '' };
                                            onChange(next);
                                        }}
                                    />
                                </Field>
                            </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="subtle" onClick={() => onChange([...value, { fa: '', en: '' }])}>
                    {t('common.addItem')}
                </Button>
            </div>
        );
    }

    const fa = isPlainObject(value) ? value.fa ?? '' : '';
    const en = isPlainObject(value) ? value.en ?? '' : '';

    return (
        <div className="space-y-3">
            <div className="text-xs text-[color:var(--dash-muted)]">{t('common.localizedValue')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label={t('common.english')}>
                    <Textarea rows={6} value={en} onChange={(e) => onChange({ fa, en: e.target.value })} />
                </Field>
                <Field label={t('common.persian')}>
                    <Textarea rows={6} value={fa} onChange={(e) => onChange({ fa: e.target.value, en })} />
                </Field>
            </div>
        </div>
    );
}

function ArrayEditor({ value, onChange, t }) {
    const [text, setText] = useState(() => JSON.stringify(value ?? [], null, 2));
    const [error, setError] = useState('');

    useEffect(() => {
        setText(JSON.stringify(value ?? [], null, 2));
        setError('');
    }, [value]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-[color:var(--dash-muted)]">{t('common.jsonArrayObject')}</div>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                        try {
                            const parsed = JSON.parse(text || 'null');
                            setText(JSON.stringify(parsed, null, 2));
                            setError('');
                        } catch {
                            setError(t('common.invalidJson'));
                        }
                    }}
                >
                    {t('common.format')}
                </Button>
            </div>

            <Textarea
                rows={12}
                value={text}
                onChange={(e) => {
                    const next = e.target.value;
                    setText(next);
                    try {
                        const parsed = JSON.parse(next || 'null');
                        if (parsed === null || typeof parsed !== 'object') {
                            setError(t('common.valueMustBeJson'));
                            return;
                        }
                        setError('');
                        onChange(parsed);
                    } catch {
                        setError(t('common.invalidJson'));
                    }
                }}
            />

            {error ? <div className="text-sm text-red-400">{error}</div> : null}
        </div>
    );
}
