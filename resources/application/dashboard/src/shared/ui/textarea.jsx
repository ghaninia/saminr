import React from 'react';

export function Textarea({ className = '', rows = 4, ...props }) {
    return (
        <textarea
            rows={rows}
            className={[
                'dash-input',
                'w-full rounded-xl bg-neutral-950/60 border border-neutral-800 px-3 py-2 text-sm outline-none',
                'focus:border-indigo-500/50 placeholder:text-neutral-600',
                'resize-y',
                className,
            ].join(' ')}
            {...props}
        />
    );
}

