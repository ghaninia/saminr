import React from 'react';

export function Textarea({ className = '', rows = 4, ...props }) {
    return (
        <textarea
            rows={rows}
            className={[
                'dash-input',
                'w-full rounded-xl bg-[color:var(--dash-input-bg)] border border-[color:var(--dash-border)] px-3 py-2 text-sm outline-none',
                'text-[color:var(--dash-fg)] focus:border-[color:var(--dash-primary)] placeholder:text-[color:var(--dash-placeholder)]',
                'resize-y',
                className,
            ].join(' ')}
            {...props}
        />
    );
}
