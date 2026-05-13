import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../application/auth/authContext.jsx';
import { ThemeProvider } from '../application/theme/themeContext.jsx';
import { RequireAuth } from './routes/requireAuth.jsx';
import { DashboardLayout } from './layouts/dashboardLayout.jsx';
import { LoginPage } from './pages/auth/loginPage.jsx';
import { ForgotPasswordPage } from './pages/auth/forgotPasswordPage.jsx';
import { HomePage } from './pages/homePage.jsx';
import { SettingsPage } from './pages/settings/settingsPage.jsx';
import { CategoriesPage } from './pages/categories/categoriesPage.jsx';
import { SubscribersPage } from './pages/newsletter/subscribersPage.jsx';
import { NewslettersPage } from './pages/newsletter/newslettersPage.jsx';
import { ReviewsPage } from './pages/reviews/reviewsPage.jsx';
import { ProductsPage } from './pages/products/productsPage.jsx';
import { ProductEditorPage } from './pages/products/productEditorPage.jsx';

export default function DashboardApp() {
    return (
        <BrowserRouter basename="/admin">
            <ThemeProvider>
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
                            <Route path="/reviews" element={<ReviewsPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/products/new" element={<ProductEditorPage />} />
                            <Route path="/products/:productId/edit" element={<ProductEditorPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
