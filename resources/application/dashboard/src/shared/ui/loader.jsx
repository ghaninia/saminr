import React from 'react';

export function FullscreenLoader({ label = 'Loading…' }) {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 grid place-items-center">
            <div className="text-sm text-neutral-400">{label}</div>
        </div>
    );
}

