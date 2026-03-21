import React from 'react';

export function Field({ label, hint, error, children }) {
    return (
        <label className="block">
            {label ? <div className="text-xs text-neutral-400 mb-1">{label}</div> : null}
            {children}
            {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
            {error ? <div className="mt-1 text-xs text-red-400">{error}</div> : null}
        </label>
    );
}

