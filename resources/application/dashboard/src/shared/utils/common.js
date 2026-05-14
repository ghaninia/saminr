export function deepClone(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
}

export function slugify(value) {
    const input = String(value ?? '')
        .trim()
        .toLowerCase();
    if (!input) return '';

    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function parseNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatPrice(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parseNumber(value, 0));
}
