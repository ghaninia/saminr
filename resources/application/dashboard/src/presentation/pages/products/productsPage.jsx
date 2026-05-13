import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { productService } from '../../../application/products/productService.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { Pagination } from '../../../shared/ui/pagination.jsx';
import { useDashboardPerPage } from '../../../shared/hooks/useDashboardPerPage.js';

export function ProductsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
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

            <div className="overflow-hidden rounded-3xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                <div className="grid grid-cols-[minmax(0,2fr)_140px_140px_160px] gap-0 bg-[color:var(--dash-surface-2)] text-xs font-semibold uppercase tracking-wider text-[color:var(--dash-muted)]">
                    <div className="px-4 py-3">Product</div>
                    <div className="px-4 py-3">Attributes</div>
                    <div className="px-4 py-3">Variants</div>
                    <div className="px-4 py-3">Actions</div>
                </div>
                <div className="divide-y divide-[color:var(--dash-border)]">
                    {pagedItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-[minmax(0,2fr)_140px_140px_160px] gap-0 items-center bg-[color:var(--dash-surface)]">
                            <div className="min-w-0 px-4 py-3">
                                <div className="truncate text-sm font-medium">{item?.title?.fa || item?.title?.en || 'Untitled'}</div>
                                <div className="mt-1 truncate text-xs text-[color:var(--dash-muted)]">{item?.short_link || 'no-short-link'}</div>
                            </div>
                            <div className="px-4 py-3 text-sm">{item?.attributes?.length ?? 0}</div>
                            <div className="px-4 py-3 text-sm">{item?.variants?.length ?? 0}</div>
                            <div className="px-4 py-3">
                                <Link to={`/products/${item.id}/edit`} className="inline-flex">
                                    <Button type="button" size="sm" variant="ghost">Open editor</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                    {!pagedItems.length ? (
                        <div className="px-4 py-10 text-center text-sm text-[color:var(--dash-muted)]">No products found.</div>
                    ) : null}
                </div>
            </div>

            <Pagination page={currentPage} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onPageChange={setCurrentPage} />
        </div>
    );
}