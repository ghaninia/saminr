import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { productService } from '../../../application/products/productService.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';

function parseNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parseNumber(value, 0));
}

function getPriceSummary(item) {
    const variants = Array.isArray(item?.variants) ? item.variants : [];
    const prices = variants
        .map((variant) => parseNumber(variant?.price, NaN))
        .filter((price) => Number.isFinite(price));

    if (prices.length > 1) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        
        if (min === max) {
            return {
                mode: 'single',
                value: min,
            };
        }
        
        return {
            mode: 'range',
            min,
            max,
        };
    }

    if (prices.length === 1) {
        return {
            mode: 'single',
            value: prices[0],
        };
    }

    return {
        mode: 'single',
        value: parseNumber(item?.base_price, 0),
    };
}

function TrendIcon({ type }) {
    if (type === 'up') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="m18 15-6-6-6 6" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

export function ProductsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [busyItemId, setBusyItemId] = useState(null);
    const perPage = useDashboardPerPage();

    useEffect(() => {
        let mounted = true;

        productService.listProducts()
            .then((products) => {
                if (!mounted) return;
                setItems(products ?? []);
            })
            .catch((requestError) => {
                if (!mounted) return;
                setError(getApiErrorMessage(requestError, 'Unable to load products.'));
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
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return items;

        return items.filter((item) => {
            const title = String(item?.title?.fa ?? item?.title?.en ?? '').toLowerCase();
            const shortLink = String(item?.short_link ?? '').toLowerCase();

            return title.includes(normalizedQuery) || shortLink.includes(normalizedQuery);
        });
    }, [items, query]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / perPage)), [filtered.length, perPage]);
    const pagedItems = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    const toggleProductStatus = async (item) => {
        const nextStatus = !Boolean(item?.is_active);
        setBusyItemId(item.id);
        setError('');

        try {
            const updated = await productService.setProductStatus(item.id, nextStatus);
            setItems((previous) => previous.map((entry) => (entry.id === item.id ? { ...entry, ...updated } : entry)));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Unable to update product status.'));
        } finally {
            setBusyItemId(null);
        }
    };

    const deleteProduct = async (item) => {
        const confirmed = window.confirm(`Delete product "${item?.title?.fa || item?.title?.en || item?.id}"?`);
        if (!confirmed) return;

        setBusyItemId(item.id);
        setError('');

        try {
            await productService.deleteProduct(item.id);
            setItems((previous) => previous.filter((entry) => entry.id !== item.id));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Unable to delete product.'));
        } finally {
            setBusyItemId(null);
        }
    };

    if (loading) return <div className="text-sm text-[color:var(--dash-muted)]">Loading products…</div>;
    if (error) return <div className="text-sm text-red-400">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="text-xl font-semibold">Products</div>
                    <div className="mt-1 text-sm text-[color:var(--dash-muted)]">
                        Browse products here and open the full-page editor for attributes, variants, and media.
                    </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="w-full md:w-64">
                        <Field label="Search">
                            <Input value={query} onChange={(event) => setQuery(event.target.value)} />
                        </Field>
                    </div>
                    <Button onClick={() => navigate('/products/new')}>Create product</Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                <div className="min-w-[860px]">
                    <div className="grid grid-cols-[minmax(280px,2fr)_170px_140px_270px] gap-0 bg-[color:var(--dash-surface-2)] text-xs font-semibold uppercase tracking-wider text-[color:var(--dash-muted)]">
                        <div className="px-4 py-3">Product</div>
                        <div className="px-4 py-3">Price (Min-Max)</div>
                        <div className="px-4 py-3">Status</div>
                        <div className="px-4 py-3">Actions</div>
                    </div>
                    <div className="divide-y divide-[color:var(--dash-border)]">
                        {pagedItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-[minmax(280px,2fr)_170px_140px_270px] gap-0 items-center bg-[color:var(--dash-surface)]">
                            <div className="min-w-0 px-4 py-3">
                                <div className="truncate text-sm font-medium">{item?.title?.fa || item?.title?.en || 'Untitled'}</div>
                                <div className="mt-1 truncate text-xs text-[color:var(--dash-muted)]">{item?.short_link || 'no-short-link'}</div>
                            </div>
                            <div className="px-4 py-3 text-sm text-[color:var(--dash-muted)]">
                                {(() => {
                                    const summary = getPriceSummary(item);

                                    if (summary.mode === 'range') {
                                        return (
                                            <div className="inline-flex items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300">
                                                    <TrendIcon type="down" />
                                                    {formatPrice(summary.min)}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                                                    <TrendIcon type="up" />
                                                    {formatPrice(summary.max)}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <span className="inline-flex items-center rounded-full border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] px-2.5 py-0.5 text-xs text-[color:var(--dash-fg)]">
                                            {formatPrice(summary.value)}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className="px-4 py-3">
                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${item?.is_active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
                                    {item?.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="px-4 py-3">
                                <div className="inline-flex overflow-hidden rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)]">
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 text-xs text-[color:var(--dash-fg)] transition hover:bg-[color:var(--dash-surface)]"
                                        onClick={() => navigate(`/products/${item.id}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="border-l border-[color:var(--dash-border)] px-3 py-1.5 text-xs text-[color:var(--dash-fg)] transition hover:bg-[color:var(--dash-surface)] disabled:opacity-50"
                                        disabled={busyItemId === item.id}
                                        onClick={() => toggleProductStatus(item)}
                                    >
                                        {item?.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        type="button"
                                        className="border-l border-[color:var(--dash-border)] px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                        disabled={busyItemId === item.id}
                                        onClick={() => deleteProduct(item)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            </div>
                        ))}
                        {!pagedItems.length ? (
                            <div className="px-4 py-10 text-center text-sm text-[color:var(--dash-muted)]">No products found.</div>
                        ) : null}
                    </div>
                </div>
            </div>

            <Pagination page={currentPage} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onPageChange={setCurrentPage} />
        </div>
    );
}