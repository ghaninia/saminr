import React, { useMemo, useState } from 'react';
import { Button } from './button.jsx';
import { Field } from './field.jsx';
import { Input } from './input.jsx';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}';

function randomChar(pool) {
    return pool[Math.floor(Math.random() * pool.length)] ?? '';
}

function shuffle(value) {
    const arr = value.split('');
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function generatePassword(length = 14, includeSymbols = true) {
    const safeLength = Math.max(8, Math.min(64, Number(length) || 14));
    const pools = includeSymbols ? [UPPER, LOWER, DIGITS, SYMBOLS] : [UPPER, LOWER, DIGITS];
    const all = pools.join('');

    let value = pools.map((pool) => randomChar(pool)).join('');
    while (value.length < safeLength) {
        value += randomChar(all);
    }

    return shuffle(value);
}

export function PasswordGenerator({ value, onChange, t, hint }) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [length, setLength] = useState(14);
    const [useSymbols, setUseSymbols] = useState(true);
    const generated = useMemo(() => generatePassword(14, true), []);

    const score = useMemo(() => {
        const current = String(value ?? '');
        let points = 0;
        if (current.length >= 8) points += 1;
        if (/[A-Z]/.test(current)) points += 1;
        if (/[a-z]/.test(current)) points += 1;
        if (/[0-9]/.test(current)) points += 1;
        if (/[^A-Za-z0-9]/.test(current)) points += 1;
        return points;
    }, [value]);

    const fill = () => {
        onChange?.(generatePassword(length, useSymbols));
        setCopied(false);
    };

    const copy = async () => {
        const target = String(value || generated);
        if (!target) return;

        try {
            await navigator.clipboard.writeText(target);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            setCopied(false);
        }
    };

    const strengthLabel = score >= 5 ? t('users.passwordStrengthStrong') : score >= 3 ? t('users.passwordStrengthMedium') : t('users.passwordStrengthWeak');
    const strengthColor = score >= 5 ? 'bg-emerald-500/80' : score >= 3 ? 'bg-amber-500/80' : 'bg-red-500/80';

    return (
        <div className="space-y-3 rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] p-3">
            <Field label={t('users.password')} hint={hint || t('users.passwordHintEdit')}>
                <div className="flex items-center gap-2">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={value ?? ''}
                        onChange={(event) => onChange?.(event.target.value)}
                    />
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? t('users.hidePassword') : t('users.showPassword')}
                    </Button>
                </div>
            </Field>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label={t('users.passwordLength')}>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="8"
                            max="32"
                            value={length}
                            onChange={(event) => setLength(Number(event.target.value))}
                            className="w-full"
                        />
                        <span className="w-8 text-right text-xs text-[color:var(--dash-muted)]">{length}</span>
                    </div>
                </Field>

                <label className="inline-flex items-center gap-2 text-sm text-[color:var(--dash-muted)] mt-6">
                    <input
                        type="checkbox"
                        checked={useSymbols}
                        onChange={(event) => setUseSymbols(event.target.checked)}
                    />
                    {t('users.includeSymbols')}
                </label>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted)]">
                    <span>{t('users.passwordStrength')}</span>
                    <span>{strengthLabel}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)]">
                    <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${Math.max(12, score * 20)}%` }} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="subtle" onClick={fill}>
                    {t('users.generatePassword')}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={copy}>
                    {copied ? t('users.copied') : t('users.copyPassword')}
                </Button>
            </div>
        </div>
    );
}
