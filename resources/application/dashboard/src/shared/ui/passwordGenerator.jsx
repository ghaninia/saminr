import React, { useState } from 'react';
import { Button } from './button.jsx';
import { Input } from './input.jsx';
import { IconKey, IconEye, IconEyeOff, IconClipboard, IconCheck, IconLock } from './passwordIcons.jsx';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/`~';

function randomChar(pool) {
    return pool[Math.floor(Math.random() * pool.length)] ?? '';
}

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function generatePassword(length = 14, includeSymbols = true) {
    const len = Math.max(8, Math.min(64, Number(length) || 14));
    const pools = includeSymbols ? [UPPER, LOWER, DIGITS, SYMBOLS] : [UPPER, LOWER, DIGITS];
    const all = pools.join('');

    const chars = pools.map((pool) => randomChar(pool));
    while (chars.length < len) {
        chars.push(randomChar(all));
    }

    return shuffle(chars).join('');
}

function getPasswordStrength(password) {
    const pwd = String(password ?? '');
    if (!pwd) return { score: 0, label: 'none', color: 'bg-gray-500/50' };

    let score = 0;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'weak', color: 'bg-red-500/60' };
    if (score <= 4) return { score, label: 'medium', color: 'bg-amber-500/60' };
    return { score, label: 'strong', color: 'bg-emerald-500/60' };
}

export function PasswordGenerator({ value, onChange, t, hint }) {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const [length, setLength] = useState(14);
    const [withSymbols, setWithSymbols] = useState(true);

    const strength = getPasswordStrength(value);
    const pwd = String(value ?? '');

    const onGenerate = () => {
        onChange?.(generatePassword(length, withSymbols));
        setCopied(false);
    };

    const onCopy = async () => {
        if (!pwd) return;
        try {
            await navigator.clipboard.writeText(pwd);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // silent
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-[color:var(--dash-fg)]">{t('users.password')}</label>
                    {pwd && (
                        <span className="text-xs text-[color:var(--dash-muted)]">
                            {t(`users.passwordStrength${strength.label.charAt(0).toUpperCase()}${strength.label.slice(1)}`)}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Input
                        type={show ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={hint || t('users.passwordHintEdit')}
                        value={pwd}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                    {pwd && (
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShow(!show)}
                            title={show ? t('users.hidePassword') : t('users.showPassword')}
                        >
                            {show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
                {pwd && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--dash-surface-2)]">
                        <div className={`h-full transition-all ${strength.color}`} style={{ width: `${Math.round((strength.score / 6) * 100)}%` }} />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button type="button" size="sm" variant="subtle" onClick={onGenerate} title="Generate password">
                    <IconKey className="h-4 w-4" />
                    {t('users.generatePassword')}
                </Button>
                {pwd && (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onCopy}
                        title={copied ? t('users.copied') : 'Copy to clipboard'}
                    >
                        {copied ? <IconCheck className="h-4 w-4" /> : <IconClipboard className="h-4 w-4" />}
                        {copied ? t('users.copied') : t('users.copyPassword')}
                    </Button>
                )}
            </div>

            {pwd && (
                <div className="flex flex-wrap gap-3 rounded-lg bg-[color:var(--dash-surface-2)] p-2.5 text-xs text-[color:var(--dash-muted)]">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[color:var(--dash-fg)]">
                        <input
                            type="range"
                            min="8"
                            max="32"
                            value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="w-20"
                        />
                        <span>{length}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[color:var(--dash-fg)]">
                        <input
                            type="checkbox"
                            checked={withSymbols}
                            onChange={(e) => setWithSymbols(e.target.checked)}
                        />
                        {t('users.includeSymbols')}
                    </label>
                </div>
            )}
        </div>
    );
}
