import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { en } from '../../shared/i18n/locales/en.js';
import { fa } from '../../shared/i18n/locales/fa.js';

const STORAGE_KEY = 'dashboard-language';
const LOCALES = { en, fa };
const DEFAULT_LOCALE = 'en';

const I18nContext = createContext(null);

function safeReadLocale() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored && LOCALES[stored] ? stored : DEFAULT_LOCALE;
    } catch {
        return DEFAULT_LOCALE;
    }
}

function resolvePath(source, path) {
    return String(path)
        .split('.')
        .reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), source);
}

function applyParams(text, params) {
    if (!params) return text;

    return Object.entries(params).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, String(value ?? '')),
        text,
    );
}

export function I18nProvider({ children }) {
    const [locale, setLocaleState] = useState(safeReadLocale);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, locale);
            document.documentElement.lang = locale;
            document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
        } catch {
            // noop
        }
    }, [locale]);

    const setLocale = (nextLocale) => {
        if (!LOCALES[nextLocale]) return;
        setLocaleState(nextLocale);
    };

    const t = (key, params) => {
        const current = resolvePath(LOCALES[locale], key);
        const fallback = resolvePath(LOCALES[DEFAULT_LOCALE], key);
        const value = current ?? fallback ?? key;
        return typeof value === 'string' ? applyParams(value, params) : value;
    };

    const value = useMemo(() => ({ locale, setLocale, t, locales: Object.keys(LOCALES) }), [locale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
