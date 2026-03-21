import React, { useEffect } from 'react';

export function Modal({ open, title, children, onClose }) {
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
                aria-label="Close"
                className="absolute inset-0 bg-black/60"
                onClick={() => onClose?.()}
            />
            <div className="relative mx-auto mt-20 w-[min(860px,calc(100%-2rem))]">
                <div className="dash-card rounded-2xl border border-neutral-800 bg-neutral-950/70 backdrop-blur">
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-neutral-800">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{title}</div>
                        </div>
                        <button
                            type="button"
                            className="text-xs text-neutral-400 hover:text-neutral-200"
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

