import React, { useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';
import { updateDashboardPerPageCache, useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';
import { deepClone } from '../../../shared/utils/common.js';
import { isLikelyImageUrl } from '../../../shared/utils/media.js';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function truncate(text, max = 70) {
    const value = String(text ?? '');
    if (value.length <= max) return value;
    return `${value.slice(0, max - 1)}…`;
}

function summarizeSettingValue(item) {
    const value = item?.value ?? null;

    if (value === null || value === undefined || value === '') return 'Empty';

    if (typeof value === 'string') {
        const filename = value.split('?')[0].split('#')[0].split('/').pop();
        return truncate(filename && filename.length < 40 ? `${filename}` : value, 70);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return 'Empty';
        const first = value[0];
        if (first && typeof first === 'object' && ('en' in first || 'fa' in first)) {
            return `${value.length} items · ${truncate(first.en ?? first.fa ?? '…', 50)}`;
        }
        return `${value.length} items`;
    }

    if (isPlainObject(value)) {
        if ('en' in value || 'fa' in value) {
            return `${truncate(value.en ?? '…', 45)} · ${truncate(value.fa ?? '…', 45)}`;
        }

        try {
            return truncate(JSON.stringify(value), 70);
        } catch {
            return 'Object';
        }
    }

    return truncate(String(value), 70);
}

export function SettingsPage() {
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

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
                setError(getApiErrorMessage(err, 'Unable to load settings.'));
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
        setUploadProgress(0);
        if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
        setSelectedPreviewUrl('');
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
            setNotice('Saved.');
        } catch (err) {
            setSaveError(getApiErrorMessage(err, 'Unable to save setting.'));
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (settingId, file) => {
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
                setUploadProgress(percent);
            },
        });
        return res.data ?? {};
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">Loading settings…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">Settings</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">Edit settings (API: `/api/admin/settings/:id`).</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="w-60">
                    <Field label="Search">
                        <Input placeholder="Filter by key…" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                                    {summarizeSettingValue(item)}
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
                                    Edit
                                </Button>
                                <div className="text-xs text-[color:var(--dash-muted-2)] group-open:text-[color:var(--dash-muted)]">View</div>
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
                    <div className="px-4 py-3 text-sm text-[color:var(--dash-muted)]">No settings found.</div>
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
                title={editing ? `Edit: ${editing.key}` : 'Edit setting'}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-xs text-[color:var(--dash-muted)]">Editing setting</div>
                            <label className="flex items-center gap-2 text-sm text-[color:var(--dash-muted)]">
                                <input
                                    type="checkbox"
                                    checked={useDefault}
                                    onChange={(e) => setUseDefault(e.target.checked)}
                                    className="accent-indigo-400"
                                />
                                Use default (clear custom value)
                            </label>
                        </div>

                        {saveError ? <div className="text-sm text-red-400">{saveError}</div> : null}

                        <div className={useDefault ? 'opacity-60 pointer-events-none' : ''}>
                            {editing.type === 'multiple' ? (
                                <MultipleEditor value={draftValue} onChange={setDraftValue} />
                            ) : editing.type === 'array' ? (
                                <ArrayEditor value={draftValue} onChange={setDraftValue} />
                            ) : editing.type === 'rich_text' || editing.type === 'text' ? (
                                <Field label="Value">
                                    <Textarea value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} rows={10} />
                                </Field>
                            ) : editing.type === 'file' || editing.type === 'image' || editing.type === 'link' ? (
                                <div className="space-y-3">
                                    <Field label="Value" hint="This value is updated automatically after upload.">
                                        <Input value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} readOnly />
                                    </Field>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-xs text-[color:var(--dash-muted-2)]">
                                            Upload an image. Stored on the `public` disk under `uploads/`.
                                        </div>
                                        <div className="inline-flex items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.webp,.svg,.ico,image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setSaveError('');
                                                    try {
                                                        setSaving(true);
                                                        setUploadProgress(0);
                                                        if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
                                                        setSelectedPreviewUrl(URL.createObjectURL(file));

                                                        const payload = await uploadFile(editing.id, file);
                                                        const url = payload?.url ?? '';
                                                        const updatedSetting = payload?.setting ?? null;
                                                        if (url) setDraftValue(url);
                                                        if (updatedSetting?.id) {
                                                            setItems((prev) =>
                                                                prev.map((x) => (x.id === updatedSetting.id ? { ...x, ...updatedSetting } : x)),
                                                            );
                                                            setEditing((prev) => (prev?.id === updatedSetting.id ? { ...prev, ...updatedSetting } : prev));
                                                            setNotice('Uploaded and saved.');
                                                        }
                                                    } catch (err) {
                                                        setSaveError(getApiErrorMessage(err, 'Upload failed.'));
                                                    } finally {
                                                        setSaving(false);
                                                        setUploadProgress(0);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="subtle"
                                                size="sm"
                                                disabled={saving}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {saving ? 'Uploading…' : 'Choose file'}
                                            </Button>
                                        </div>
                                    </div>
                                    {saving && uploadProgress > 0 ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted-2)]">
                                                <div>Uploading</div>
                                                <div>{uploadProgress}%</div>
                                            </div>
                                            <div className="h-2 rounded-full bg-[color:var(--dash-surface-3)] border border-[color:var(--dash-border)] overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500/70"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}
                                    {selectedPreviewUrl ? (
                                        <div className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)] p-3">
                                            <div className="text-xs text-[color:var(--dash-muted-2)] mb-2">Selected file preview</div>
                                            <img
                                                src={selectedPreviewUrl}
                                                alt="Selected preview"
                                                className="max-h-36 object-contain rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-input-bg)]"
                                            />
                                        </div>
                                    ) : null}
                                    {draftValue && isLikelyImageUrl(String(draftValue)) ? (
                                        <div className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)] p-3">
                                            <div className="text-xs text-[color:var(--dash-muted-2)] mb-2">Stored file preview</div>
                                            <img
                                                src={String(draftValue)}
                                                alt="Preview"
                                                className="max-h-36 object-contain rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-input-bg)]"
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ) : editing.type === 'email' ? (
                                <Field label="Email">
                                    <Input type="email" autoComplete="email" value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            ) : editing.type === 'website' ? (
                                <Field label="Website URL" hint="Include https://">
                                    <Input type="url" inputMode="url" value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            ) : editing.type === 'number' ? (
                                <Field label="Number">
                                    <Input type="number" inputMode="numeric" value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            ) : (
                                <Field label="Value">
                                    <Input value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
                                </Field>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="subtle" onClick={closeEditor} disabled={saving}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={save} disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}

function MultipleEditor({ value, onChange }) {
    if (Array.isArray(value)) {
        return (
            <div className="space-y-3">
                <div className="text-xs text-[color:var(--dash-muted)]">Localized list (fa/en)</div>
                <div className="space-y-3">
                    {value.map((row, idx) => (
                        <div key={idx} className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)] p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-[color:var(--dash-muted-2)]">Item {idx + 1}</div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onChange(value.filter((_, i) => i !== idx))}
                                >
                                    Remove
                                </Button>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="English (en)">
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
                                <Field label="Persian (fa)">
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
                    Add item
                </Button>
            </div>
        );
    }

    const fa = isPlainObject(value) ? value.fa ?? '' : '';
    const en = isPlainObject(value) ? value.en ?? '' : '';

    return (
        <div className="space-y-3">
            <div className="text-xs text-[color:var(--dash-muted)]">Localized value (fa/en)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="English (en)">
                    <Textarea rows={6} value={en} onChange={(e) => onChange({ fa, en: e.target.value })} />
                </Field>
                <Field label="Persian (fa)">
                    <Textarea rows={6} value={fa} onChange={(e) => onChange({ fa: e.target.value, en })} />
                </Field>
            </div>
        </div>
    );
}

function ArrayEditor({ value, onChange }) {
    const [text, setText] = useState(() => JSON.stringify(value ?? [], null, 2));
    const [error, setError] = useState('');

    useEffect(() => {
        setText(JSON.stringify(value ?? [], null, 2));
        setError('');
    }, [value]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-[color:var(--dash-muted)]">JSON Array/Object</div>
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
                            setError('Invalid JSON.');
                        }
                    }}
                >
                    Format
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
                            setError('Value must be a JSON array or object.');
                            return;
                        }
                        setError('');
                        onChange(parsed);
                    } catch {
                        setError('Invalid JSON.');
                    }
                }}
            />

            {error ? <div className="text-sm text-red-400">{error}</div> : null}
        </div>
    );
}
