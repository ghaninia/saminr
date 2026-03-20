import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="text-2xl font-semibold">React is ready</h1>
            <p className="mt-2 text-sm text-gray-600">
                Your React frontend is running through Vite inside Docker.
            </p>
        </div>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
