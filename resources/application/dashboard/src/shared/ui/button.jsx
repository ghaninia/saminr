import React from 'react';

export function Button({ className = '', variant = 'primary', size = 'md', ...props }) {
    const base =
        'dash-btn inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none';

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-3.5 py-2.5 text-sm',
    };

    const variants = {
        primary: 'dash-btn-primary bg-white text-neutral-900 hover:bg-neutral-100',
        subtle: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
        ghost: 'bg-transparent text-neutral-200 hover:bg-neutral-800/60',
        danger: 'bg-red-500/90 text-white hover:bg-red-500',
    };

    return <button className={[base, sizes[size], variants[variant], className].join(' ')} {...props} />;
}
