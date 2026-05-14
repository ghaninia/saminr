export function isLikelyImageUrl(url) {
    if (!url) return false;
    return /\.(png|jpe?g|webp|svg|ico)(\?.*)?$/i.test(url) || String(url).startsWith('data:image/');
}
