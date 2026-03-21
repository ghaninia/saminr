import React from 'react';

export function Input({ className = '', ...props }) {
    return (
        <input
            className={[
                'dash-input',
                'w-full rounded-xl bg-neutral-950/60 border border-neutral-800 px-3 py-2 text-sm outline-none',
                'focus:border-indigo-500/50 placeholder:text-neutral-600',
                className,
            ].join(' ')}
            {...props}
        />
    );
}
