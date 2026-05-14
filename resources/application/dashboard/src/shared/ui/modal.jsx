import React, { useEffect } from 'react';
import { useI18n } from '../../application/i18n/i18nContext.jsx';

export function Modal({ open, title, children, onClose }) {
    const { t } = useI18n();
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label={t('common.close')}
                className="absolute inset-0 bg-[color:var(--dash-overlay)]"
                onClick={() => onClose?.()}
            />
            <div className="relative mx-auto mt-20 w-[min(860px,calc(100%-2rem))]">
                <div className="dash-card rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] backdrop-blur">
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[color:var(--dash-border)]">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{title}</div>
                        </div>
                        <button
                            type="button"
                            className="text-xs text-[color:var(--dash-muted)] hover:text-[color:var(--dash-fg)]"
                            onClick={() => onClose?.()}
                        >
                            Esc
                        </button>
                    </div>
                    <div className="p-5">{children}</div>
                </div>
            </div>
        </div>
    );
}
