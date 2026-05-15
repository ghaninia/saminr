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
    const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatPrice(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parseNumber(value, 0));
}

export function normalizeDecimalInput(value) {
    let text = String(value ?? '')
        .replace(/,/g, '')
        .replace(/[^0-9.]/g, '');

    const firstDotIndex = text.indexOf('.');
    if (firstDotIndex >= 0) {
        text = text.slice(0, firstDotIndex + 1) + text.slice(firstDotIndex + 1).replace(/\./g, '');
    }

    if (text.startsWith('.')) {
        text = `0${text}`;
    }

    return text;
}

export function formatDecimalInput(value) {
    const normalized = normalizeDecimalInput(value);
    if (!normalized) return '';

    const hasDot = normalized.includes('.');
    const [intPart, decPart = ''] = normalized.split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return hasDot ? `${grouped}.${decPart}` : grouped;
}

const FA_UNITS = [
    '', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه',
    'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده',
];
const FA_TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const FA_HUNDREDS = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const FA_SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

function tripletToFaWords(value) {
    const parts = [];
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;

    if (hundreds > 0) {
        parts.push(FA_HUNDREDS[hundreds]);
    }

    if (rest > 0) {
        if (rest < 20) {
            parts.push(FA_UNITS[rest]);
        } else {
            const tens = Math.floor(rest / 10);
            const units = rest % 10;
            if (tens > 0) parts.push(FA_TENS[tens]);
            if (units > 0) parts.push(FA_UNITS[units]);
        }
    }

    return parts.join(' و ');
}

function numberToFaWords(input) {
    const value = Math.trunc(Math.abs(Number(input)));
    if (!Number.isFinite(value) || value === 0) return 'صفر';

    const parts = [];
    let remain = value;
    let scale = 0;

    while (remain > 0 && scale < FA_SCALES.length) {
        const triplet = remain % 1000;
        if (triplet > 0) {
            const tripletWords = tripletToFaWords(triplet);
            const scaleLabel = FA_SCALES[scale];

            if (scale === 1 && triplet === 1) {
                parts.unshift(scaleLabel);
            } else if (scaleLabel) {
                parts.unshift(`${tripletWords} ${scaleLabel}`);
            } else {
                parts.unshift(tripletWords);
            }
        }

        remain = Math.floor(remain / 1000);
        scale += 1;
    }

    return parts.join(' و ');
}

export function formatTomanPreview(value, locale = 'fa') {
    const raw = Number(value);
    if (!Number.isFinite(raw)) return '';

    const amount = Math.max(0, Math.round(raw));

    if (locale === 'fa') {
        return `${numberToFaWords(amount)} تومان`;
    }

    return `${amount} Toman`;
}
