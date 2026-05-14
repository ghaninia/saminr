import React, { useState, useEffect } from 'react';
import { cx } from '../utils/cx.js';

export function StatWidget({ icon: Icon, label, value, unit, loading, color = 'blue' }) {
    const colorMap = {
        blue: 'border-blue-500/30 bg-blue-500/5 text-blue-300',
        emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
        amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
        red: 'border-red-500/30 bg-red-500/5 text-red-300',
        purple: 'border-purple-500/30 bg-purple-500/5 text-purple-300',
        cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
    };

    return (
        <div className={cx(
            'rounded-xl border px-4 py-3.5 transition-all',
            colorMap[color] || colorMap.blue,
        )}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-medium text-[color:var(--dash-muted)] uppercase tracking-wider">
                        {label}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        {loading ? (
                            <div className="h-7 w-16 animate-pulse rounded bg-[color:var(--dash-surface-2)]" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold tabular-nums">
                                    {typeof value === 'number' ? value.toLocaleString() : '–'}
                                </div>
                                {unit && <span className="text-xs text-[color:var(--dash-muted)]">{unit}</span>}
                            </>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--dash-surface-2)] opacity-60">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
