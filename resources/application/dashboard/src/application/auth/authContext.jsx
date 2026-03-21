import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authRepository } from '../../infrastructure/auth/authRepository.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);

    useEffect(() => {
        let mounted = true;
        authRepository
            .me()
            .then((me) => {
                if (!mounted) return;
                setUser(me);
            })
            .catch(() => {
                if (!mounted) return;
                setUser(null);
            })
            .finally(() => {
                if (!mounted) return;
                setBooting(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const login = useCallback(async (email, password) => {
        const me = await authRepository.login(email, password);
        setUser(me);
        return me;
    }, []);

    const logout = useCallback(async () => {
        await authRepository.logout();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            booting,
            isAuthenticated: Boolean(user),
            login,
            logout,
        }),
        [user, booting, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

