import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/auth/authContext.jsx';
import { Button } from '../../shared/ui/button.jsx';
import { LanguageToggle } from '../../shared/ui/languageToggle.jsx';
import { ThemeToggle } from '../../shared/ui/themeToggle.jsx';
import { useI18n } from '../../application/i18n/i18nContext.jsx';
import { cx } from '../../shared/utils/cx.js';

function IconHome(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </svg>
    );
}

function IconSettings(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.99l.04.04a2.2 2.2 0 0 1-1.56 3.75 2.2 2.2 0 0 1-1.56-.65l-.04-.04a1.8 1.8 0 0 0-1.99-.36 1.8 1.8 0 0 0-1.06 1.63V22a2.2 2.2 0 0 1-4.4 0v-.06a1.8 1.8 0 0 0-1.06-1.63 1.8 1.8 0 0 0-1.99.36l-.04.04a2.2 2.2 0 0 1-3.12 0 2.2 2.2 0 0 1 0-3.12l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.63-1.06H3a2.2 2.2 0 0 1 0-4.4h-.06A1.8 1.8 0 0 0 4.6 8.48a1.8 1.8 0 0 0-.36-1.99l-.04-.04a2.2 2.2 0 0 1 0-3.12 2.2 2.2 0 0 1 3.12 0l.04.04a1.8 1.8 0 0 0 1.99.36 1.8 1.8 0 0 0 1.06-1.63V2a2.2 2.2 0 0 1 4.4 0v.06a1.8 1.8 0 0 0 1.06 1.63 1.8 1.8 0 0 0 1.99-.36l.04-.04a2.2 2.2 0 0 1 3.12 0 2.2 2.2 0 0 1 0 3.12l-.04.04a1.8 1.8 0 0 0-.36 1.99 1.8 1.8 0 0 0 1.63 1.06H22a2.2 2.2 0 0 1 0 4.4h-.06A1.8 1.8 0 0 0 19.4 15Z" />
        </svg>
    );
}

function IconTag(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M20.6 13.2 13.2 20.6a2 2 0 0 1-2.8 0L3 13.2V3h10.2l7.4 7.4a2 2 0 0 1 0 2.8Z" />
            <path d="M7.5 7.5h.01" />
        </svg>
    );
}

function IconUsers(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function IconMail(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M4 4h16v16H4z" />
            <path d="m22 6-10 7L2 6" />
        </svg>
    );
}

function IconMessage(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function IconStar(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

function IconBox(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
            <path d="M3 7.5V16.5L12 21" />
            <path d="M21 7.5V16.5L12 21" />
        </svg>
    );
}

function IconMenu(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function IconLogout(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

function IconClose(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function NavItem({ to, label, icon: Icon, onClick }) {
    const location = useLocation();
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`));

    return (
        <Link
            to={to}
            onClick={onClick}
            className={cx(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors border',
                active
                    ? 'bg-[color:var(--dash-surface-2)] text-[color:var(--dash-fg)] border-[color:var(--dash-border)]'
                    : 'text-[color:var(--dash-muted)] hover:bg-[color:var(--dash-surface-3)] hover:text-[color:var(--dash-fg)] border-transparent',
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
}

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useI18n();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/', label: t('layout.overview'), icon: IconHome },
        { to: '/products', label: t('layout.products'), icon: IconBox },
        { to: '/categories', label: t('layout.categories'), icon: IconTag },
        { to: '/users', label: t('layout.users'), icon: IconUsers },
        { to: '/reviews', label: t('layout.reviews'), icon: IconStar },
        { to: '/subscribers', label: t('layout.subscribers'), icon: IconUsers },
        { to: '/newsletters', label: t('layout.newsletters'), icon: IconMail },
        { to: '/contact-messages', label: t('layout.contactMessages'), icon: IconMessage },
        { to: '/settings', label: t('layout.settings'), icon: IconSettings },
    ];

    const handleLogout = async () => {
        if (!window.confirm(t('layout.logoutConfirm'))) return;
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="dash-bg min-h-screen flex flex-col">
            {/* ─── Top Navbar ─── */}
            <header className="sticky top-0 z-50 border-b border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] backdrop-blur-md">
                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Brand */}
                    <div className="flex items-center gap-3 shrink-0 me-2">
                        <div className="h-9 w-9 rounded-xl bg-[color:var(--dash-surface-2)] border border-[color:var(--dash-border)] grid place-items-center text-[10px] font-bold tracking-widest">
                            ADM
                        </div>
                        <span className="text-sm font-semibold hidden sm:block truncate max-w-[140px]">
                            {t('layout.brand')}
                        </span>
                    </div>

                    {/* Desktop Nav — scrollable so it never wraps */}
                    <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
                        {navItems.map(item => (
                            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
                        ))}
                    </nav>

                    {/* Right controls */}
                    <div className="flex items-center gap-2 ms-auto shrink-0">
                        <LanguageToggle />
                        <ThemeToggle />
                        <button
                            className="hidden sm:grid h-9 w-9 place-items-center rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-btn-subtle-bg)] text-[color:var(--dash-fg)] hover:bg-[color:var(--dash-btn-subtle-hover)] transition-colors"
                            onClick={handleLogout}
                            title={t('layout.logout')}
                            aria-label={t('layout.logout')}
                        >
                            <IconLogout className="h-4 w-4" />
                        </button>

                        {/* Hamburger — visible on mobile/tablet only */}
                        <button
                            className="md:hidden p-2 rounded-xl border border-[color:var(--dash-border)] hover:bg-[color:var(--dash-surface-3)] transition-colors"
                            onClick={() => setMobileMenuOpen(v => !v)}
                            aria-label={t('layout.toggleMenu')}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen
                                ? <IconClose className="h-5 w-5" />
                                : <IconMenu className="h-5 w-5" />
                            }
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[color:var(--dash-border)] px-4 py-3 flex flex-col gap-1 bg-[color:var(--dash-surface)]">
                        {navItems.map(item => (
                            <NavItem
                                key={item.to}
                                to={item.to}
                                label={item.label}
                                icon={item.icon}
                                onClick={() => setMobileMenuOpen(false)}
                            />
                        ))}
                        <div className="mt-2 pt-2 border-t border-[color:var(--dash-border)]">
                            <div className="text-xs text-[color:var(--dash-muted)] mb-2 px-1 truncate">{user?.email}</div>
                            <Button variant="subtle" className="w-full justify-center gap-2" onClick={handleLogout}>
                                <IconLogout className="h-4 w-4" />
                                {t('layout.logout')}
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* ─── Main Content ─── */}
            <main className="flex-1 w-full px-4 py-6 dash-scroll">
                <Outlet />
            </main>
        </div>
    );
}
