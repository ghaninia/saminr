import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../application/auth/authContext.jsx';
import { RequireAuth } from './routes/requireAuth.jsx';
import { DashboardLayout } from './layouts/dashboardLayout.jsx';
import { LoginPage } from './pages/auth/loginPage.jsx';
import { ForgotPasswordPage } from './pages/auth/forgotPasswordPage.jsx';
import { HomePage } from './pages/homePage.jsx';
import { SettingsPage } from './pages/settings/settingsPage.jsx';

export default function DashboardApp() {
    return (
        <BrowserRouter basename="/admin">
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route
                        element={
                            <RequireAuth>
                                <DashboardLayout />
                            </RequireAuth>
                        }
                    >
                        <Route path="/" element={<HomePage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

