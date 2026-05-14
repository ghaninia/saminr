import React from 'react';
import { useI18n } from '../../application/i18n/i18nContext.jsx';
import { cx } from '../utils/cx.js';

const LABELS = {
    en: 'EN',
    fa: 'FA',
};

export function LanguageToggle({ className = '' }) {
    const { locale, setLocale } = useI18n();

    return (
        <div className={cx('inline-flex items-center gap-1 rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-1', className)}>
            {Object.keys(LABELS).map((key) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => setLocale(key)}
                    className={cx(
                        'min-w-10 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                        locale === key
                            ? 'bg-[color:var(--dash-surface-2)] text-[color:var(--dash-fg)]'
                            : 'text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]',
                    )}
                    aria-pressed={locale === key}
                >
                    {LABELS[key]}
                </button>
            ))}
        </div>
    );
}
