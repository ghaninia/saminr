import React from 'react';
import { useAuth } from '../../application/auth/authContext.jsx';

export function HomePage() {
    const { user } = useAuth();

    return (
        <div>
            <div className="text-lg font-semibold">Welcome</div>
            <div className="mt-1 text-sm text-neutral-400">Signed in as {user?.email}.</div>
            <div className="mt-6 text-sm text-neutral-300">
                This admin panel is intentionally minimal and lightweight, but structured for maintainability.
            </div>
        </div>
    );
}

