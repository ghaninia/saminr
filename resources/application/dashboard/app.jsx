import '../bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import DashboardApp from './dashboardApp.jsx';
import './styles.css';

const rootElement = document.getElementById('dashboard');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <DashboardApp />
        </React.StrictMode>,
    );
}
