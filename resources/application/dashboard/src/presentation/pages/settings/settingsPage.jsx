import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Modal } from '../../../shared/ui/modal.jsx';
import { Textarea } from '../../../shared/ui/textarea.jsx';

function deepClone(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState('');

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
            setItems((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
            setEditing(null);
            setNotice('Saved.');
        } catch (err) {
            setSaveError(getApiErrorMessage(err, 'Unable to save setting.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-sm text-neutral-400">Loading settings…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">Settings</div>
                    <div className="mt-1 text-sm text-neutral-400">Edit settings (API: `/api/admin/settings/:id`).</div>
                    {notice ? <div className="mt-2 text-sm text-emerald-400">{notice}</div> : null}
                </div>
                <div className="w-60">
                    <Field label="Search">
                        <Input placeholder="Filter by key…" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </Field>
                </div>
            </div>

            <div className="mt-4 divide-y divide-neutral-800 rounded-xl border border-neutral-800 overflow-hidden">
                {filtered.map((item) => (
                    <details key={item.id} className="group">
                        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-4 hover:bg-neutral-900/40">
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{item.key}</div>
                                <div className="mt-1 text-xs text-neutral-400">{item.type}</div>
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
                                <div className="text-xs text-neutral-500 group-open:text-neutral-300">View</div>
                            </div>
                        </summary>
                        <div className="px-4 pb-4">
                            <pre className="dash-scroll text-xs text-neutral-200 bg-neutral-950/50 border border-neutral-800 rounded-lg px-3 py-2 overflow-auto">
                                {JSON.stringify(item.value, null, 2)}
                            </pre>
                        </div>
                    </details>
                ))}
                {!filtered.length ? <div className="px-4 py-3 text-sm text-neutral-400">No settings found.</div> : null}
            </div>

            <Modal
                open={Boolean(editing)}
                title={editing ? `Edit: ${editing.key}` : 'Edit setting'}
                onClose={closeEditor}
            >
                {editing ? (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs text-neutral-400">Type</div>
                                <div className="text-sm text-neutral-200">{editing.type}</div>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-neutral-300">
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
                            ) : editing.type === 'rich_text' || editing.type === 'text' ? (
                                <Field label="Value">
                                    <Textarea value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} rows={10} />
                                </Field>
                            ) : editing.type === 'image' ? (
                                <Field label="Value" hint="Image URL or path (e.g. /images/foo.png)">
                                    <Input value={draftValue ?? ''} onChange={(e) => setDraftValue(e.target.value)} />
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
                <div className="text-xs text-neutral-400">Localized list (fa/en)</div>
                <div className="space-y-3">
                    {value.map((row, idx) => (
                        <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-neutral-500">Item {idx + 1}</div>
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
            <div className="text-xs text-neutral-400">Localized value (fa/en)</div>
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
