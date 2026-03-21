import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';

export function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');

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

    if (loading) return <div className="text-sm text-neutral-400">Loading settings…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">Settings</div>
                    <div className="mt-1 text-sm text-neutral-400">Read-only list (API: `/api/admin/settings`).</div>
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
                            <div className="text-xs text-neutral-500 group-open:text-neutral-300">View</div>
                        </summary>
                        <div className="px-4 pb-4">
                            <pre className="text-xs text-neutral-200 bg-neutral-950/50 border border-neutral-800 rounded-lg px-3 py-2 overflow-auto">
                                {JSON.stringify(item.value, null, 2)}
                            </pre>
                        </div>
                    </details>
                ))}
                {!filtered.length ? <div className="px-4 py-3 text-sm text-neutral-400">No settings found.</div> : null}
            </div>
        </div>
    );
}

