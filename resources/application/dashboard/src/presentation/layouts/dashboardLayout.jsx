import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/auth/authContext.jsx';
import { Button } from '../../shared/ui/button.jsx';
import { Card } from '../../shared/ui/card.jsx';
import { cx } from '../../shared/utils/cx.js';

function NavItem({ to, label }) {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link
            to={to}
            className={cx(
                'block rounded-xl px-3 py-2 text-sm',
                active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300 hover:bg-neutral-800/60',
            )}
        >
            {label}
        </Link>
    );
}

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dash-bg min-h-screen text-neutral-100">
            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-neutral-800 grid place-items-center text-xs tracking-wider text-neutral-200">
                            ADM
                        </div>
                        <div className="leading-tight">
                            <div className="text-sm font-medium">Admin Dashboard</div>
                            <div className="text-xs text-neutral-400">{user?.email}</div>
                        </div>
                    </div>
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

                <div className="mt-6 grid grid-cols-12 gap-4">
                    <aside className="col-span-12 md:col-span-3">
                        <Card className="p-3">
                            <nav className="space-y-1">
                                <NavItem to="/" label="Home" />
                                <NavItem to="/settings" label="Settings" />
                                <NavItem to="/categories" label="Categories" />
                            </nav>
                        </Card>
                    </aside>
                    <main className="col-span-12 md:col-span-9">
                        <Card className="p-5 dash-scroll">
                            <Outlet />
                        </Card>
                    </main>
                </div>
            </div>
        </div>
    );
}
