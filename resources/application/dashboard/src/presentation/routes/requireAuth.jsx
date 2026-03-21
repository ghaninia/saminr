import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../application/auth/authContext.jsx';
import { FullscreenLoader } from '../../shared/ui/loader.jsx';

export function RequireAuth({ children }) {
    const { isAuthenticated, booting } = useAuth();
    const location = useLocation();

    if (booting) return <FullscreenLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

