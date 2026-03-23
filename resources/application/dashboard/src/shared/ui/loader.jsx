import React from 'react';

export function FullscreenLoader({ label = 'Loading…' }) {
    return (
        <div className="min-h-screen bg-[color:var(--dash-page-bg)] text-[color:var(--dash-fg)] grid place-items-center">
            <div className="text-sm text-[color:var(--dash-muted)]">{label}</div>
        </div>
    );
}
