import React from 'react';

export function Button({ className = '', variant = 'primary', size = 'md', ...props }) {
    const base =
        'dash-btn inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none';

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-3.5 py-2.5 text-sm',
    };

    const variants = {
        primary: 'dash-btn-primary bg-[color:var(--dash-btn-primary-bg)] text-[color:var(--dash-btn-primary-fg)] hover:bg-[color:var(--dash-btn-primary-hover)]',
        subtle: 'bg-[color:var(--dash-btn-subtle-bg)] text-[color:var(--dash-fg)] hover:bg-[color:var(--dash-btn-subtle-hover)]',
        ghost: 'bg-transparent text-[color:var(--dash-fg)] hover:bg-[color:var(--dash-surface-3)]',
        danger: 'bg-red-500/90 text-white hover:bg-red-500',
    };

    return <button className={[base, sizes[size], variants[variant], className].join(' ')} {...props} />;
}
