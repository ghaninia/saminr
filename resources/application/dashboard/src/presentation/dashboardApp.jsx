import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../application/auth/authContext.jsx';
import { RequireAuth } from './routes/requireAuth.jsx';
import { DashboardLayout } from './layouts/dashboardLayout.jsx';
import { LoginPage } from './pages/auth/loginPage.jsx';
import { ForgotPasswordPage } from './pages/auth/forgotPasswordPage.jsx';
import { HomePage } from './pages/homePage.jsx';
import { SettingsPage } from './pages/settings/settingsPage.jsx';
import { CategoriesPage } from './pages/categories/categoriesPage.jsx';
import { SubscribersPage } from './pages/newsletter/subscribersPage.jsx';
import { NewslettersPage } from './pages/newsletter/newslettersPage.jsx';

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
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/subscribers" element={<SubscribersPage />} />
                        <Route path="/newsletters" element={<NewslettersPage />} />
                        <Route path="/newsletter" element={<Navigate to="/newsletters" replace />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
