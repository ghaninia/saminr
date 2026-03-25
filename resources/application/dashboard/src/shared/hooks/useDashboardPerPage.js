import { useEffect, useState } from 'react';
import { adminApi } from '../../infrastructure/http/adminApi.js';

const DEFAULT_PER_PAGE = 10;
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 100;

let cachedPerPage = null;
let inflight = null;
const DASHBOARD_PER_PAGE_EVENT = 'dashboard-per-page-changed';

function normalizePerPage(value) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed)) return DEFAULT_PER_PAGE;
    return Math.min(MAX_PER_PAGE, Math.max(MIN_PER_PAGE, parsed));
}

async function fetchPerPageFromSettings() {
    if (cachedPerPage !== null) return cachedPerPage;
    if (inflight) return inflight;

    inflight = adminApi
        .get('/settings')
        .then((res) => {
            const items = res.data?.data ?? [];
            const row = items.find((x) => String(x?.key ?? '') === 'dashboard_items_per_page');
            cachedPerPage = normalizePerPage(row?.value ?? row?.default ?? DEFAULT_PER_PAGE);
            return cachedPerPage;
        })
        .catch(() => DEFAULT_PER_PAGE)
        .finally(() => {
            inflight = null;
        });

    return inflight;
}

export function updateDashboardPerPageCache(value) {
    cachedPerPage = normalizePerPage(value);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DASHBOARD_PER_PAGE_EVENT, { detail: cachedPerPage }));
    }

    return cachedPerPage;
}

export function useDashboardPerPage() {
    const [perPage, setPerPage] = useState(cachedPerPage ?? DEFAULT_PER_PAGE);

    useEffect(() => {
        let mounted = true;

        fetchPerPageFromSettings().then((value) => {
            if (!mounted) return;
            setPerPage(normalizePerPage(value));
        });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const onChanged = (event) => {
            setPerPage(normalizePerPage(event?.detail));
        };

        window.addEventListener(DASHBOARD_PER_PAGE_EVENT, onChanged);

        return () => {
            window.removeEventListener(DASHBOARD_PER_PAGE_EVENT, onChanged);
        };
    }, []);

    return perPage;
}
