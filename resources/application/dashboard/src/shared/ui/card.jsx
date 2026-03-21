import React from 'react';

export function Card({ className = '', ...props }) {
    return (
        <div
            className={[
                'dash-card',
                'rounded-2xl border border-neutral-800 bg-neutral-900/40',
                'backdrop-blur supports-[backdrop-filter]:bg-neutral-900/30',
                className,
            ].join(' ')}
            {...props}
        />
    );
}
