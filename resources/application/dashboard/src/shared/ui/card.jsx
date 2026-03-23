import React from 'react';

export function Card({ className = '', ...props }) {
    return (
        <div
            className={[
                'dash-card',
                'rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]',
                'backdrop-blur supports-[backdrop-filter]:bg-[color:var(--dash-surface)]',
                className,
            ].join(' ')}
            {...props}
        />
    );
}
