import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './samin/App.jsx';
import './samin/global.css';

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
