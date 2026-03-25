import React, { useMemo } from 'react';
import { Button } from './button.jsx';

function buildPages(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    if (currentPage <= 3) {
        pages.add(2);
        pages.add(3);
    }
    if (currentPage >= totalPages - 2) {
        pages.add(totalPages - 1);
        pages.add(totalPages - 2);
    }

    return Array.from(pages)
        .filter((n) => n >= 1 && n <= totalPages)
        .sort((a, b) => a - b);
}

export function Pagination({ page = 1, totalPages = 1, totalItems = null, perPage = null, onPageChange }) {
    const safePage = Math.max(1, page);
    const safeTotalPages = Math.max(1, totalPages);

    const pages = useMemo(() => buildPages(safePage, safeTotalPages), [safePage, safeTotalPages]);

    if (safeTotalPages <= 1) {
        return totalItems === null ? null : (
            <div className="mt-3 text-xs text-[color:var(--dash-muted-2)]">Total: {totalItems}</div>
        );
    }

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[color:var(--dash-muted-2)]">
                Page {safePage} of {safeTotalPages}
                {totalItems !== null ? ` • Total ${totalItems}` : ''}
                {perPage !== null ? ` • ${perPage} per page` : ''}
            </div>

            <div className="flex items-center gap-1.5">
                <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => onPageChange?.(safePage - 1)}
                >
                    Prev
                </Button>

                {pages.map((p, idx) => {
                    const prev = pages[idx - 1];
                    const hasGap = typeof prev === 'number' && p - prev > 1;

                    return (
                        <React.Fragment key={p}>
                            {hasGap ? <span className="px-1 text-xs text-[color:var(--dash-muted-2)]">…</span> : null}
                            <Button
                                type="button"
                                variant={p === safePage ? 'primary' : 'subtle'}
                                size="sm"
                                onClick={() => onPageChange?.(p)}
                                className="min-w-9"
                            >
                                {p}
                            </Button>
                        </React.Fragment>
                    );
                })}

                <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    disabled={safePage >= safeTotalPages}
                    onClick={() => onPageChange?.(safePage + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
