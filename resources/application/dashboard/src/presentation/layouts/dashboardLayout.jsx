import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/auth/authContext.jsx';
import { Button } from '../../shared/ui/button.jsx';
import { Card } from '../../shared/ui/card.jsx';
import { ThemeToggle } from '../../shared/ui/themeToggle.jsx';
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

function NavItem({ to, label, icon: Icon }) {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link
            to={to}
            className={cx(
                'group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                'border border-transparent',
                active
                    ? 'bg-[color:var(--dash-surface-2)] text-[color:var(--dash-fg)] border-[color:var(--dash-border)]'
                    : 'text-[color:var(--dash-muted)] hover:bg-[color:var(--dash-surface-3)] hover:text-[color:var(--dash-fg)]',
            )}
        >
            <span
                className={cx(
                    'h-8 w-8 rounded-xl grid place-items-center',
                    active ? 'bg-[color:var(--dash-surface-3)]' : 'bg-transparent group-hover:bg-[color:var(--dash-surface-3)]',
                )}
            >
                <Icon className="h-4 w-4" />
            </span>
            {label}
        </Link>
    );
}

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dash-bg min-h-screen">
            <div className="sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 pt-6">
                    <div className="rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] backdrop-blur">
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-2xl bg-[color:var(--dash-surface-2)] border border-[color:var(--dash-border)] grid place-items-center text-xs tracking-wider">
                                    ADM
                                </div>
                                <div className="leading-tight min-w-0">
                                    <div className="text-sm font-semibold truncate">Admin Dashboard</div>
                                    <div className="text-xs text-[color:var(--dash-muted)] truncate">{user?.email}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <Button
                                    variant="subtle"
                                    onClick={async () => {
                                        await logout();
                                        navigate('/login', { replace: true });
                                    }}
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-10">
                <div className="mt-4 grid grid-cols-12 gap-4">
                    <aside className="col-span-12 md:col-span-4 lg:col-span-3">
                        <Card className="p-3">
                            <div className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--dash-muted-2)]">
                                Navigation
                            </div>
                            <nav className="space-y-1">
                                <NavItem to="/" label="Overview" icon={IconHome} />
                                <NavItem to="/settings" label="Settings" icon={IconSettings} />
                                <NavItem to="/categories" label="Categories" icon={IconTag} />
                                <NavItem to="/subscribers" label="Subscribers" icon={IconUsers} />
                                <NavItem to="/newsletters" label="Newsletters" icon={IconMail} />
                            </nav>
                        </Card>
                    </aside>
                    <main className="col-span-12 md:col-span-8 lg:col-span-9">
                        <Card className="p-5 dash-scroll">
                            <Outlet />
                        </Card>
                    </main>
                </div>
            </div>
        </div>
    );
}
